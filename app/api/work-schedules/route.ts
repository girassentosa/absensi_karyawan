import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// Force dynamic rendering (no cache) - agar data selalu fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/work-schedules - Get all work schedules
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseServer
      .from('work_schedules')
      .select('*')
      .order('day_of_week', { ascending: true });

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

// PUT /api/work-schedules - Update work schedule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      start_time, 
      on_time_end_time, 
      tolerance_start_time, 
      tolerance_end_time, 
      end_time, 
      is_active, 
      late_tolerance_minutes 
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (start_time !== undefined) updateData.start_time = start_time;
    if (on_time_end_time !== undefined) updateData.on_time_end_time = on_time_end_time || null;
    if (tolerance_start_time !== undefined) updateData.tolerance_start_time = tolerance_start_time || null;
    if (tolerance_end_time !== undefined) updateData.tolerance_end_time = tolerance_end_time || null;
    if (end_time !== undefined) updateData.end_time = end_time;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (late_tolerance_minutes !== undefined) updateData.late_tolerance_minutes = late_tolerance_minutes;

    const { data, error } = await supabaseServer
      .from('work_schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Work schedule updated successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

