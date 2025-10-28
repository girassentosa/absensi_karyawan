import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// POST /api/face-recognition/verify - Verify face for attendance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { face_descriptor, employee_id } = body;

    if (!face_descriptor) {
      return NextResponse.json(
        { success: false, error: 'face_descriptor is required' },
        { status: 400 }
      );
    }

    if (!employee_id) {
      return NextResponse.json(
        { success: false, error: 'employee_id is required' },
        { status: 400 }
      );
    }

    // Get employee with face encoding path
    const { data: employee, error } = await supabaseServer
      .from('employees')
      .select('face_encoding_path')
      .eq('id', employee_id)
      .single();

    if (error || !employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found or no face registered' },
        { status: 404 }
      );
    }

    if (!employee.face_encoding_path) {
      return NextResponse.json(
        { success: false, error: 'No face encoding found for this employee' },
        { status: 404 }
      );
    }

    // TODO: Load face encoding from storage and compare
    // For now, we'll simulate the comparison
    // In real implementation:
    // const { data: encodedFace } = await supabaseServer
    //   .storage
    //   .from('face-encodings')
    //   .download(employee.face_encoding_path);
    
    // const storedDescriptor = JSON.parse(await encodedFace.text());
    
    // Import compareFaces function
    // const similarity = await compareFaces(face_descriptor, storedDescriptor);
    
    // Threshold: 70% similarity
    const match_threshold = 70;
    
    // Simulate matching (replace with actual comparison)
    const simulatedSimilarity = Math.random() * 20 + 75; // 75-95%
    const match = simulatedSimilarity >= match_threshold;

    return NextResponse.json({ 
      success: true,
      match,
      similarity: simulatedSimilarity,
      threshold: match_threshold,
      message: match 
        ? 'Face verified successfully' 
        : 'Face verification failed'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

