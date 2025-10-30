import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// Helper: Calculate time difference in minutes (time2 - time1)
function getMinutesDifference(time1: string, time2: string): number {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

// Helper: Convert time string to minutes from 00:00
function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// POST /api/attendance/check-in - Check-in with face recognition + smart validation
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

    const now = new Date();
    const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTimeStr = now.toTimeString().slice(0, 5); // HH:MM
    const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

    // 1. CHECK HOLIDAY
    const { data: holidayData } = await supabaseServer
      .from('holidays')
      .select('*')
      .eq('date', currentDateStr)
      .eq('is_active', true)
      .single();

    if (holidayData) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Hari ini adalah hari libur: ${holidayData.name}`,
          holiday: holidayData
        },
        { status: 400 }
      );
    }

    // 2. CHECK WORK SCHEDULE
    const { data: scheduleData } = await supabaseServer
      .from('work_schedules')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .single();

    if (!scheduleData) {
      return NextResponse.json(
        { success: false, error: 'Jadwal kerja untuk hari ini belum dikonfigurasi' },
        { status: 400 }
      );
    }

    if (!scheduleData.is_active) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Hari ini (${scheduleData.day_name}) bukan hari kerja`,
          schedule: scheduleData
        },
        { status: 400 }
      );
    }

    // 3. CHECK IF TOO EARLY (more than 1 hour before work starts)
    const minutesBeforeStart = getMinutesDifference(currentTimeStr, scheduleData.start_time);
    if (minutesBeforeStart < -60) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Terlalu pagi untuk check-in. Jam kerja dimulai pukul ${scheduleData.start_time}`,
          schedule: scheduleData
        },
        { status: 400 }
      );
    }

    // 4. CHECK IF ALREADY CHECKED IN TODAY
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
        { success: false, error: 'Anda sudah check-in hari ini' },
        { status: 400 }
      );
    }

    // 5. DETERMINE STATUS dengan rentang bebas dari database
    let status = 'present';
    let notes = '';
    let lateDuration = 0;
    let statusDetail: 'on_time' | 'within_tolerance' | 'late_beyond' = 'on_time';

    // Ambil rentang waktu dari database (atau hitung fallback jika NULL)
    const startTime = scheduleData.start_time;
    
    // Akhir jendela "Tepat Waktu"
    let onTimeEnd = scheduleData.on_time_end_time;
    if (!onTimeEnd) {
      // Fallback: hitung dari start_time + late_tolerance_minutes
      const startMin = timeToMinutes(startTime);
      const tol = Math.max(0, scheduleData.late_tolerance_minutes || 0);
      const totalMin = startMin + tol;
      const [h, m] = [Math.floor(totalMin / 60) % 24, totalMin % 60];
      onTimeEnd = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    
    // Awal jendela "Dalam Toleransi"
    let toleranceStart = scheduleData.tolerance_start_time;
    if (!toleranceStart) {
      toleranceStart = onTimeEnd; // Default: langsung setelah on_time_end
    }
    
    // Akhir jendela "Dalam Toleransi"
    let toleranceEnd = scheduleData.tolerance_end_time;
    if (!toleranceEnd) {
      // Fallback: hitung dari tolerance_start + late_tolerance_minutes
      const tolStartMin = timeToMinutes(toleranceStart);
      const tol = Math.max(0, scheduleData.late_tolerance_minutes || 0);
      const totalMin = tolStartMin + tol;
      const [h, m] = [Math.floor(totalMin / 60) % 24, totalMin % 60];
      toleranceEnd = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    // Tentukan status berdasarkan waktu check-in
    const checkInMin = timeToMinutes(currentTimeStr);
    const startMin = timeToMinutes(startTime);
    const onTimeEndMin = timeToMinutes(onTimeEnd);
    const toleranceStartMin = timeToMinutes(toleranceStart);
    const toleranceEndMin = timeToMinutes(toleranceEnd);

    if (checkInMin >= startMin && checkInMin <= onTimeEndMin) {
      // Tepat Waktu: di dalam rentang [start_time .. on_time_end_time]
      status = 'present';
      statusDetail = 'on_time';
      const minutesLate = Math.max(0, checkInMin - startMin);
      if (minutesLate > 0) {
        notes = `Tepat waktu (masuk ${minutesLate} menit setelah jam mulai)`;
      }
    } else if (checkInMin > onTimeEndMin && checkInMin <= toleranceEndMin) {
      // Dalam Toleransi: di dalam rentang (on_time_end_time .. tolerance_end_time]
      status = 'present';
      statusDetail = 'within_tolerance';
      const minutesLate = checkInMin - startMin;
      notes = `Hadir dalam toleransi (+${minutesLate} menit)`;
    } else if (checkInMin > toleranceEndMin) {
      // Lewat Toleransi: setelah tolerance_end_time
      status = 'late';
      statusDetail = 'late_beyond';
      lateDuration = checkInMin - startMin;
      notes = `Terlambat ${lateDuration} menit (melewati batas toleransi: ${toleranceEnd})`;
    } else {
      // Sebelum start_time (masih dianggap tepat waktu jika tidak terlalu pagi)
      status = 'present';
      statusDetail = 'on_time';
    }

    // 6. INSERT CHECK-IN RECORD
    const { data, error } = await supabaseServer
      .from('attendance')
      .insert({
        employee_id,
        check_in_time: now.toISOString(),
        check_in_latitude: latitude,
        check_in_longitude: longitude,
        office_location_id: location_id,
        face_match_score,
        status,
        notes: notes || null
      })
      .select()
      .single();

    if (error) throw error;

    // 7. RETURN SUCCESS WITH DETAILED MESSAGE
    let message = '✅ Check-in berhasil!';
    if (status === 'late') {
      message = `⚠️ Check-in berhasil (Terlambat ${lateDuration} menit)`;
    }

    return NextResponse.json({ 
      success: true,
      data,
      message,
      details: {
        status,
        statusDetail,
        lateDuration,
        workSchedule: `${scheduleData.start_time} - ${scheduleData.end_time}`,
        lateToleranceMinutes: scheduleData.late_tolerance_minutes
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

