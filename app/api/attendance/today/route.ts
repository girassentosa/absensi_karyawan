import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/attendance/today - Get today's attendance (using Asia/Jakarta timezone)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employee_id = searchParams.get('employee_id');

    // Get current date in Asia/Jakarta timezone
    const now = new Date();
    const jakartaFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const jakartaParts = jakartaFormatter.formatToParts(now);
    const year = parseInt(jakartaParts.find(p => p.type === 'year')?.value || '0');
    const month = parseInt(jakartaParts.find(p => p.type === 'month')?.value || '0');
    const day = parseInt(jakartaParts.find(p => p.type === 'day')?.value || '0');
    
    // Create Jakarta date at 00:00:00 using Date.UTC and then subtract 7 hours offset
    // Jakarta is UTC+7, so we need to subtract 7 hours from UTC to get Jakarta midnight in UTC
    const jakartaMidnightUTC = Date.UTC(year, month - 1, day, 0, 0, 0, 0) - (7 * 60 * 60 * 1000);
    const jakartaTomorrowMidnightUTC = jakartaMidnightUTC + (24 * 60 * 60 * 1000);
    
    // Convert to ISO string for database query
    const todayStart = new Date(jakartaMidnightUTC).toISOString();
    const todayEnd = new Date(jakartaTomorrowMidnightUTC).toISOString();

    let query = supabaseServer
      .from('attendance')
      .select('*, employees(*)')
      .gte('check_in_time', todayStart)
      .lt('check_in_time', todayEnd);

    if (employee_id) {
      query = query.eq('employee_id', employee_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

