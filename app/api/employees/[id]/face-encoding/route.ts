import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// PUT /api/employees/[id]/face-encoding - Update face encoding path
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { faceEncoding, matchScore } = body;

    if (!faceEncoding) {
      return NextResponse.json(
        { success: false, error: 'faceEncoding is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      face_encoding_path: faceEncoding,
      updated_at: new Date().toISOString()
    };

    // Add match score if provided (from training)
    if (matchScore !== undefined && matchScore !== null) {
      updateData.face_match_score = parseFloat(matchScore);
      console.log('💾 Saving face match score:', matchScore);
    }

    // Update face encoding and match score
    const { data, error } = await supabaseServer
      .from('employees')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Face encoding and score saved successfully for employee:', data.full_name);

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Face encoding saved successfully'
    });
  } catch (error: any) {
    console.error('❌ Error saving face encoding:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

