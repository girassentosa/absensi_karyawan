import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// GET /api/attendance/today - Get today's attendance
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employee_id = searchParams.get('employee_id');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = supabaseServer
      .from('attendance')
      .select('*, employees(*)')
      .gte('check_in_time', today.toISOString())
      .lt('check_in_time', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

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

