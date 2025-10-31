import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    // Get current time in Asia/Jakarta timezone
    const now = new Date();
    
    // Use Intl.DateTimeFormat for accurate timezone conversion
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
    const jakartaDateObj = {
      year: parseInt(jakartaParts.find(p => p.type === 'year')?.value || '0'),
      month: parseInt(jakartaParts.find(p => p.type === 'month')?.value || '0'),
      day: parseInt(jakartaParts.find(p => p.type === 'day')?.value || '0')
    };
    
    // Find today's check-in record (using Asia/Jakarta date)
    // Create date objects for Jakarta timezone date range
    const jakartaToday = new Date(jakartaDateObj.year, jakartaDateObj.month - 1, jakartaDateObj.day, 0, 0, 0);
    const jakartaTomorrow = new Date(jakartaToday);
    jakartaTomorrow.setDate(jakartaTomorrow.getDate() + 1);
    
    const { data: checkInRecord, error: findError } = await supabaseServer
      .from('attendance')
      .select('*')
      .eq('employee_id', employee_id)
      .gte('check_in_time', jakartaToday.toISOString())
      .lt('check_in_time', jakartaTomorrow.toISOString())
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

