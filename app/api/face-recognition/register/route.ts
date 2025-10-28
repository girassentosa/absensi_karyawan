import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// POST /api/face-recognition/register - Register face for employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, face_descriptor } = body;

    if (!employee_id || !face_descriptor) {
      return NextResponse.json(
        { success: false, error: 'employee_id and face_descriptor are required' },
        { status: 400 }
      );
    }

    // Convert face descriptor to JSON string
    const faceDescriptorString = JSON.stringify(face_descriptor);

    // Create unique file name
    const fileName = `face_${employee_id}_${Date.now()}.json`;
    const filePath = `face-encodings/${fileName}`;

    // In a real implementation, you would save to storage
    // For now, we'll store the path in database
    // You should save the actual file to Supabase Storage

    // Update employee record with face encoding path
    const { data, error } = await supabaseServer
      .from('employees')
      .update({ 
        face_encoding_path: filePath,
        updated_at: new Date().toISOString()
      })
      .eq('id', employee_id)
      .select()
      .single();

    if (error) throw error;

    // TODO: Save face descriptor to Supabase Storage
    // await supabaseServer.storage
    //   .from('face-encodings')
    //   .upload(fileName, faceDescriptorString);

    return NextResponse.json({ 
      success: true,
      data,
      message: 'Face registered successfully',
      face_encoding_path: filePath
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

