import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/attendance/history - Get attendance history with month/year filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employee_id = searchParams.get('employee_id');
    const limit = parseInt(searchParams.get('limit') || '1000'); // Increased for month view
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Month/Year filtering parameters
    const month = searchParams.get('month'); // 1-12
    const year = searchParams.get('year'); // 2024, 2025, etc
    const startMonth = searchParams.get('startMonth');
    const startYear = searchParams.get('startYear');
    const endMonth = searchParams.get('endMonth');
    const endYear = searchParams.get('endYear');
    
    // Date range filtering parameters (for "Hari Ini" and "7 Hari" filters)
    const startDate = searchParams.get('startDate'); // ISO string
    const endDate = searchParams.get('endDate'); // ISO string

    let query = supabaseServer
      .from('attendance')
      .select(`
        *,
        employees(
          *,
          app_users!employees_user_id_fkey (
            avatar_url
          )
        )
      `)
      .order('check_in_time', { ascending: false });

    // Filter by employee_id if provided
    if (employee_id) {
      query = query.eq('employee_id', employee_id);
    }

    // Filter by single month/year if provided
    if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      // Calculate start and end of month using Asia/Jakarta timezone
      // Start: YYYY-MM-01 00:00:00 Jakarta = YYYY-MM-01 00:00:00 - 7h in UTC
      // End: YYYY-MM+1-01 00:00:00 Jakarta
      const startDateUTC = Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0, 0) - (7 * 60 * 60 * 1000);
      const endDateUTC = Date.UTC(yearNum, monthNum, 1, 0, 0, 0, 0) - (7 * 60 * 60 * 1000);
      
      query = query
        .gte('check_in_time', new Date(startDateUTC).toISOString())
        .lt('check_in_time', new Date(endDateUTC).toISOString());
    }
    // Filter by month range if provided
    else if (startMonth && startYear && endMonth && endYear) {
      const startMonthNum = parseInt(startMonth);
      const startYearNum = parseInt(startYear);
      const endMonthNum = parseInt(endMonth);
      const endYearNum = parseInt(endYear);
      
      // Start of start month
      const startDateUTC = Date.UTC(startYearNum, startMonthNum - 1, 1, 0, 0, 0, 0) - (7 * 60 * 60 * 1000);
      // Start of end month + 1 (to include entire end month)
      const endDateUTC = Date.UTC(endYearNum, endMonthNum, 1, 0, 0, 0, 0) - (7 * 60 * 60 * 1000);
      
      query = query
        .gte('check_in_time', new Date(startDateUTC).toISOString())
        .lt('check_in_time', new Date(endDateUTC).toISOString());
    }
    // Filter by date range if provided (for "Hari Ini" and "7 Hari" filters)
    else if (startDate && endDate) {
      query = query
        .gte('check_in_time', startDate)
        .lt('check_in_time', endDate);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    // Flatten the data to include avatar_url from app_users
    const flattenedData = data?.map((attendance: any) => ({
      ...attendance,
      employees: {
        ...attendance.employees,
        avatar_url: attendance.employees?.app_users?.avatar_url || null,
        app_users: undefined
      }
    })) || [];

    return NextResponse.json({ 
      success: true, 
      data: flattenedData 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

