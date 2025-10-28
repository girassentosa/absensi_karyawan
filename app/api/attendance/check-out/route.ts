import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// POST /api/attendance/check-out - Check-out
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, latitude, longitude } = body;

    if (!employee_id) {
      return NextResponse.json(
        { success: false, error: 'employee_id is required' },
        { status: 400 }
      );
    }

    // Find today's check-in record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: checkInRecord, error: findError } = await supabaseServer
      .from('attendance')
      .select('*')
      .eq('employee_id', employee_id)
      .gte('check_in_time', today.toISOString())
      .lt('check_in_time', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .is('check_out_time', null)
      .order('check_in_time', { ascending: false })
      .limit(1)
      .single();

    if (findError || !checkInRecord) {
      return NextResponse.json(
        { success: false, error: 'No check-in record found for today' },
        { status: 404 }
      );
    }

    // Check if already checked out
    if (checkInRecord.check_out_time) {
      return NextResponse.json(
        { success: false, error: 'Already checked out today' },
        { status: 400 }
      );
    }

    // Update check-out record
    const { data, error } = await supabaseServer
      .from('attendance')
      .update({
        check_out_time: new Date().toISOString(),
        check_out_latitude: latitude,
        check_out_longitude: longitude,
        updated_at: new Date().toISOString()
      })
      .eq('id', checkInRecord.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      data,
      message: 'Check-out successful'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

