import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// POST /api/attendance/check-in - Check-in with face recognition
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, face_match_score, latitude, longitude, location_id } = body;

    if (!employee_id) {
      return NextResponse.json(
        { success: false, error: 'employee_id is required' },
        { status: 400 }
      );
    }

    // Check if employee exists
    const { data: employee } = await supabaseServer
      .from('employees')
      .select('id, is_active')
      .eq('id', employee_id)
      .single();

    if (!employee || !employee.is_active) {
      return NextResponse.json(
        { success: false, error: 'Employee not found or inactive' },
        { status: 404 }
      );
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: existingCheckIn } = await supabaseServer
      .from('attendance')
      .select('id')
      .eq('employee_id', employee_id)
      .gte('check_in_time', today.toISOString())
      .lt('check_in_time', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .is('check_out_time', null)
      .single();

    if (existingCheckIn) {
      return NextResponse.json(
        { success: false, error: 'Already checked in today' },
        { status: 400 }
      );
    }

    // Insert check-in record
    const { data, error } = await supabaseServer
      .from('attendance')
      .insert({
        employee_id,
        check_in_time: new Date().toISOString(),
        check_in_latitude: latitude,
        check_in_longitude: longitude,
        office_location_id: location_id,
        face_match_score,
        status: 'present'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      data,
      message: 'Check-in successful'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

