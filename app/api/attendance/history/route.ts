import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// GET /api/attendance/history - Get attendance history
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employee_id = searchParams.get('employee_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

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
      .order('check_in_time', { ascending: false })
      .range(offset, offset + limit - 1);

    if (employee_id) {
      query = query.eq('employee_id', employee_id);
    }

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

