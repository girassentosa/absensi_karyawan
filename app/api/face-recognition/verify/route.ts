import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

/**
 * Calculate Euclidean distance between two face descriptors
 * Lower distance = more similar faces
 */
function calculateEuclideanDistance(descriptor1: number[], descriptor2: number[]): number {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Descriptors must have the same length');
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Convert Euclidean distance to similarity percentage
 * Distance 0 = 100% similarity
 * Distance 1 = 0% similarity
 */
function distanceToSimilarity(distance: number): number {
  // Face-api.js typical distance range: 0 to 1.5
  // Good match: < 0.6
  // Threshold at 0.6 ≈ 80% similarity
  const maxDistance = 1.0;
  const similarity = Math.max(0, Math.min(100, (1 - distance / maxDistance) * 100));
  return Math.round(similarity * 100) / 100; // Round to 2 decimal places
}

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

    // Validate face_descriptor is an array of numbers
    if (!Array.isArray(face_descriptor) || face_descriptor.length !== 128) {
      return NextResponse.json(
        { success: false, error: 'face_descriptor must be an array of 128 numbers' },
        { status: 400 }
      );
    }

    // Get employee with face encoding path
    const { data: employee, error: employeeError } = await supabaseServer
      .from('employees')
      .select('face_encoding_path, full_name')
      .eq('id', employee_id)
      .single();

    if (employeeError || !employee) {
      console.error('❌ Employee not found:', employeeError);
      return NextResponse.json(
        { success: false, error: 'Employee not found or no face registered' },
        { status: 404 }
      );
    }

    if (!employee.face_encoding_path) {
      return NextResponse.json(
        { success: false, error: 'No face encoding found for this employee. Please register your face first.' },
        { status: 404 }
      );
    }

    console.log('🔍 Verifying face for employee:', employee.full_name);
    console.log('📁 Face encoding path:', employee.face_encoding_path);

    // Download stored face encoding from Supabase Storage
    const { data: encodedFaceBlob, error: downloadError } = await supabaseServer
      .storage
      .from('face-encodings')
      .download(employee.face_encoding_path);

    if (downloadError || !encodedFaceBlob) {
      console.error('❌ Failed to download face encoding:', downloadError);
      return NextResponse.json(
        { success: false, error: 'Failed to load stored face encoding. Please re-register your face.' },
        { status: 500 }
      );
    }

    // Parse stored face encoding
    const encodedFaceText = await encodedFaceBlob.text();
    const storedData = JSON.parse(encodedFaceText);
    
    if (!storedData.descriptor || !Array.isArray(storedData.descriptor)) {
      console.error('❌ Invalid stored face encoding format');
      return NextResponse.json(
        { success: false, error: 'Invalid stored face encoding format. Please re-register your face.' },
        { status: 500 }
      );
    }

    const storedDescriptor = storedData.descriptor;
    console.log('✅ Stored descriptor loaded, length:', storedDescriptor.length);

    // Calculate Euclidean distance between descriptors
    const distance = calculateEuclideanDistance(face_descriptor, storedDescriptor);
    console.log('📊 Euclidean distance:', distance);

    // Convert distance to similarity percentage
    const similarity = distanceToSimilarity(distance);
    console.log('📊 Similarity:', similarity + '%');

    // Get face recognition threshold from system settings
    const { data: settings } = await supabaseServer
      .from('system_settings')
      .select('value')
      .eq('key', 'face_recognition_threshold')
      .single();

    const match_threshold = settings?.value ? parseInt(settings.value) : 80;
    console.log('🎯 Threshold:', match_threshold + '%');

    // Determine if face matches
    const match = similarity >= match_threshold;

    if (match) {
      console.log('✅ Face verification PASSED');
    } else {
      console.log('❌ Face verification FAILED');
    }

    return NextResponse.json({ 
      success: true,
      match,
      similarity: similarity,
      threshold: match_threshold,
      distance: distance,
      message: match 
        ? `Face verified successfully! Similarity: ${similarity}%`
        : `Face verification failed. Similarity: ${similarity}% (required: ${match_threshold}%)`
    });
  } catch (error: any) {
    console.error('❌ Error in face verification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Face verification failed' },
      { status: 500 }
    );
  }
}

