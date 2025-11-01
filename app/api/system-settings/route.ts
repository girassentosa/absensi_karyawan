import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// Disable caching untuk memastikan pengaturan selalu fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/system-settings - Get all system settings
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseServer
      .from('system_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (error) throw error;

    // Convert array to object for easier access
    const settings: Record<string, any> = {};
    data?.forEach(setting => {
      settings[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description,
        id: setting.id
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: settings
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/system-settings - Update system settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { face_recognition_threshold, gps_accuracy_radius } = body;

    // Validate inputs
    if (face_recognition_threshold !== undefined) {
      const threshold = parseInt(face_recognition_threshold);
      if (isNaN(threshold) || threshold < 50 || threshold > 100) {
        return NextResponse.json(
          { success: false, error: 'Face recognition threshold must be between 50-100%' },
          { status: 400 }
        );
      }

      // Update face recognition threshold
      const { error: thresholdError } = await supabaseServer
        .from('system_settings')
        .update({ 
          setting_value: threshold.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'face_recognition_threshold');

      if (thresholdError) throw thresholdError;
    }

    if (gps_accuracy_radius !== undefined) {
      const radius = parseInt(gps_accuracy_radius);
      if (isNaN(radius) || radius < 10 || radius > 10000) {
        return NextResponse.json(
          { success: false, error: 'GPS radius must be between 10-10000 meters' },
          { status: 400 }
        );
      }

      // Update GPS radius
      const { error: radiusError } = await supabaseServer
        .from('system_settings')
        .update({ 
          setting_value: radius.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'gps_accuracy_radius');

      if (radiusError) throw radiusError;
    }

    return NextResponse.json({ 
      success: true,
      message: 'System settings updated successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

