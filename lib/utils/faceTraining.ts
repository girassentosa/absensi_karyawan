'use client';

import {
  loadFaceModels,
  detectFaceAndGetDescriptor,
  compareFaceDescriptors,
  serializeDescriptor,
  deserializeDescriptor,
  averageDescriptors,
  distanceToSimilarity,
  calculateFaceDistance
} from './faceModels';

// Simple face training system using face-api.js (REAL face recognition)
export interface FaceTrainingStep {
  id: number;
  instruction: string;
  completed: boolean;
  imageData?: string;
}

export const TRAINING_STEPS: FaceTrainingStep[] = [
  { id: 1, instruction: "Lihat lurus ke kamera", completed: false },
  { id: 2, instruction: "Anggukkan kepala ke atas", completed: false },
  { id: 3, instruction: "Anggukkan kepala ke bawah", completed: false },
  { id: 4, instruction: "Toleh ke kiri", completed: false },
  { id: 5, instruction: "Toleh ke kanan", completed: false },
  { id: 6, instruction: "Senyum", completed: false },
];

/**
 * Get camera stream for face training
 */
export async function getCameraStream(): Promise<MediaStream | null> {
  try {
    console.log('🔍 Checking camera support...');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('❌ Camera not supported in this browser');
      return null;
    }

    console.log('📱 Requesting camera permission...');
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });
    
    console.log('✅ Camera stream obtained successfully');
    return stream;
  } catch (error: any) {
    console.error('❌ Error accessing camera:', error);
    
    if (error.name === 'NotAllowedError') {
      console.error('🚫 Camera permission denied');
    } else if (error.name === 'NotFoundError') {
      console.error('📷 No camera found');
    } else if (error.name === 'NotReadableError') {
      console.error('🔒 Camera is being used by another application');
    }
    
    return null;
  }
}

/**
 * Stop camera stream
 */
export function stopCameraStream(stream: MediaStream | null) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

/**
 * Capture image from video element
 */
export function captureImage(video: HTMLVideoElement): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Error capturing image:', error);
    return null;
  }
}

/**
 * REAL face detection and analysis using face-api.js
 * Returns ACTUAL face confidence based on face detection model
 */
export async function analyzeVideoFrame(video: HTMLVideoElement): Promise<{ 
  detected: boolean; 
  confidence: number; 
  descriptor?: Float32Array;
  error?: string;
}> {
  try {
    // Ensure models are loaded
    const modelsReady = await loadFaceModels();
    if (!modelsReady) {
      return { 
        detected: false, 
        confidence: 0,
        error: 'Models not loaded. Please refresh the page.'
      };
    }

    // REAL face detection with face-api.js
    const result = await detectFaceAndGetDescriptor(video);
    
    if (!result) {
      // No face detected
      return { detected: false, confidence: 0 };
    }

    // Return REAL confidence from face detection model
    return {
      detected: true,
      confidence: result.confidence,
      descriptor: result.descriptor
    };
  } catch (error: any) {
    console.error('❌ Error analyzing video frame:', error);
    return {
      detected: false, 
      confidence: 0,
      error: error.message
    };
  }
}

/**
 * REAL face training with actual face detection
 * Uses face-api.js to detect faces and extract 128D descriptors
 */
export async function performRealTimeTraining(
  video: HTMLVideoElement,
  stepInstruction: string,
  onProgress: (confidence: number) => void,
  onComplete: (encoding: string, finalScore: number) => void,
  onError: (error: string) => void
): Promise<void> {
  let isAnalyzing = true;
  let bestDescriptor: Float32Array | null = null;
  let bestConfidence = 0;
  
  // ⚡ NEW SIMPLE APPROACH: Cari 5 frame yang PASTI >= 85%!
  const goodFrames: { descriptor: Float32Array; confidence: number }[] = [];
  const requiredGoodFrames = 5;
  const targetConfidence = 85;
  const maxStdDeviation = 5; // Max 5% variation for consistency
  let currentFrameIndex = 0;

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎯 Starting training: ${stepInstruction}`);
  console.log(`📋 Need ${requiredGoodFrames} frames with >= ${targetConfidence}% confidence`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // Ensure models are loaded before starting
  const modelsReady = await loadFaceModels();
  if (!modelsReady) {
    onError('Gagal memuat model AI. Silakan refresh halaman dan coba lagi.');
    return;
  }

  const analyzeFrame = async () => {
    if (!isAnalyzing) return; // ⚡ STOP if already completed!

    try {
      // REAL face detection
      const result = await analyzeVideoFrame(video);
      
      if (result.error) {
        isAnalyzing = false;
        onError(result.error);
        return;
      }

      // Update progress with REAL confidence (only if still analyzing!)
      if (isAnalyzing) {
    onProgress(result.confidence);
      }

      if (result.detected && result.descriptor) {
        // ⚡ Check if this frame is GOOD (>= 85%)
    if (result.confidence >= targetConfidence) {
          // ✅ DAPAT FRAME BAGUS!
          console.log(`✅ FRAME ${currentFrameIndex + 1}/${requiredGoodFrames} CAPTURED! Confidence: ${result.confidence}%`);
          
          // Save this good frame
          goodFrames.push({
            descriptor: result.descriptor,
            confidence: result.confidence
          });
          
          // Track best
          if (result.confidence > bestConfidence) {
            bestConfidence = result.confidence;
            bestDescriptor = result.descriptor;
          }
          
          currentFrameIndex++;
          
          // ⚡ Check if we have all 5 frames
          if (goodFrames.length >= requiredGoodFrames) {
            // ✅ SEMUA FRAME SUDAH DAPAT!
        isAnalyzing = false;
            
            // Calculate statistics
            const confidences = goodFrames.map(f => f.confidence);
            const avg = confidences.reduce((a, b) => a + b, 0) / confidences.length;
            const variance = confidences.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / confidences.length;
            const stdDev = Math.sqrt(variance);
            
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`🎉 ALL ${requiredGoodFrames} FRAMES CAPTURED!`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📊 Frames: [${confidences.join(', ')}]`);
            console.log(`📊 Average: ${avg.toFixed(1)}%`);
            console.log(`📊 Best: ${bestConfidence}%`);
            console.log(`📊 StdDev: ${stdDev.toFixed(2)}% (max allowed: ${maxStdDeviation}%)`);
            
            // ⚡ VALIDATE CONSISTENCY
            if (stdDev <= maxStdDeviation) {
              console.log(`✅ CONSISTENCY CHECK PASSED! (${stdDev.toFixed(2)}% ≤ ${maxStdDeviation}%)`);
              console.log(`🎯 Using BEST frame: ${bestConfidence}%`);
              console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
              
              const encoding = serializeDescriptor(bestDescriptor!);
              onComplete(encoding, bestConfidence);
              return;
            } else {
              // ❌ CONSISTENCY FAILED!
              console.warn(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
              console.warn(`⚠️ CONSISTENCY CHECK FAILED!`);
              console.warn(`⚠️ StdDev: ${stdDev.toFixed(2)}% > ${maxStdDeviation}%`);
              console.warn(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
              
              onError(
                `Kualitas tidak konsisten! 😔\n\n` +
                `Variasi confidence: ${stdDev.toFixed(1)}% (max: ${maxStdDeviation}%)\n` +
                `Frames: [${confidences.join(', ')}]\n\n` +
                `Kemungkinan penyebab:\n` +
                `• Cahaya tidak stabil (berkedip, bayangan)\n` +
                `• Wajah bergerak terlalu banyak\n` +
                `• Kamera shake atau tidak fokus\n` +
                `• Attempt spoofing (foto/video)\n\n` +
                `💡 Tips:\n` +
                `• Gunakan cahaya yang stabil\n` +
                `• Jangan bergerak saat training\n` +
                `• Pastikan kamera fokus & stabil\n` +
                `• Jarak tetap (30-50 cm)`
              );
        return;
            }
          }
          
          // ⏸️ Pause sebentar sebelum cari frame berikutnya
          console.log(`⏸️ Pausing 500ms before next frame...`);
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          console.log(`🎯 FRAME ${currentFrameIndex + 1}/${requiredGoodFrames}: ${stepInstruction}`);
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        } else {
          // ⚠️ Frame belum cukup bagus, terus cari!
          console.log(`🔄 Loading... ${result.confidence}% (need >= ${targetConfidence}%)`);
      }
    } else {
        // No face detected
        console.log(`👤 No face detected, keep looking...`);
    }

    // Continue analyzing ONLY if still active
    if (isAnalyzing) {
    requestAnimationFrame(analyzeFrame);
    }
    } catch (error: any) {
      // ⚠️ Use console.warn for user-facing errors
      console.warn('⚠️ Frame analysis error:', error);
      isAnalyzing = false;
      onError(`Error: ${error.message}`);
    }
  };

  // Start analysis
  // ⚡ Start dengan log untuk FRAME 1
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎯 FRAME 1/${requiredGoodFrames}: ${stepInstruction}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  analyzeFrame();

  // ⚡ Timeout after 120 seconds (no time limit per frame, but overall safety)
  setTimeout(() => {
    if (isAnalyzing) {
      isAnalyzing = false;
      console.warn(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.warn(`⏰ Training timeout after 120 seconds`);
      console.warn(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      if (bestDescriptor && bestConfidence >= 70) {
        console.log(`✅ Using best result: ${bestConfidence}%`);
        const encoding = serializeDescriptor(bestDescriptor);
        onComplete(encoding, bestConfidence);
      } else {
        // ⚠️ User-friendly error message
        if (bestConfidence === 0) {
          // No face detected at all
          onError(
            `Wajah tidak terdeteksi! 😔\n\n` +
            `Kemungkinan penyebab:\n` +
            `• Cahaya terlalu gelap atau terlalu terang\n` +
            `• Wajah terlalu jauh dari kamera\n` +
            `• Kamera tertutup atau tidak fokus\n` +
            `• Posisi wajah tidak menghadap kamera\n\n` +
            `💡 Tips:\n` +
            `• Gunakan cahaya yang cukup\n` +
            `• Jarak ideal: 30-50 cm dari kamera\n` +
            `• Pastikan wajah terlihat jelas di kotak putih`
          );
      } else {
          // Low confidence (1-69%)
          onError(
            `Kualitas deteksi wajah kurang baik 😔\n\n` +
            `Confidence: ${bestConfidence}% (minimum: 70%)\n\n` +
            `💡 Tips untuk meningkatkan kualitas:\n` +
            `• Tambahkan pencahayaan di wajah\n` +
            `• Bersihkan lensa kamera\n` +
            `• Dekatkan wajah ke kamera (30-50 cm)\n` +
            `• Lepas kacamata atau masker (jika ada)\n` +
            `• Pastikan wajah tepat di tengah kotak putih\n` +
            `• Hindari gerakan saat training`
          );
        }
      }
    }
  }, 120000); // ⚡ 120 seconds (2 minutes) karena tidak ada batas per frame
}

/**
 * ⚡ ADAPTIVE face verification (OPTION 3!)
 * - Adjust strictness based on training score
 * - Collect multiple frames for consistency
 * - Validate against training baseline
 */
export async function performInstantVerification(
  video: HTMLVideoElement,
  storedEncoding: string,
  onProgress: (status: string, confidence: number) => void,
  onComplete: (success: boolean, similarity: number, confidence: number) => void,
  trainingScore?: number, // ← NEW: Training score from DB
  thresholdOverride?: number // ← NEW: Threshold override from component (fresh from DB)
): Promise<void> {
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`⚡ Starting ADAPTIVE face verification (OPTION 3)`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // Load models
  const modelsReady = await loadFaceModels();
  if (!modelsReady) {
    onComplete(false, 0, 0);
    return;
  }

  // Deserialize stored descriptor
  let storedDescriptor: Float32Array;
  try {
    storedDescriptor = deserializeDescriptor(storedEncoding);
    console.log(`📊 Loaded stored face descriptor (${storedDescriptor.length}D)`);
  } catch (error) {
    console.error('❌ Failed to deserialize stored encoding:', error);
    onComplete(false, 0, 0);
    return;
  }

  // Use threshold from component if provided (already fresh), otherwise fetch from API
  let threshold = thresholdOverride || 80; // Use override first (fresh from component)
  
  if (!thresholdOverride) {
    // Fallback: Fetch threshold from API if not provided (for backward compatibility)
    try {
      const response = await fetch('/api/system-settings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();
      if (data.success) {
        threshold = parseInt(data.data.face_recognition_threshold?.value || '80');
        console.log(`⚙️ Using threshold from database (fallback): ${threshold}%`);
      }
    } catch (error) {
      console.log('⚠️ Using default threshold: 80%');
    }
  } else {
    console.log(`⚙️ Using threshold from component (fresh): ${threshold}%`);
  }

  // ⚡ ADAPTIVE PARAMETERS based on training score
  let requiredFrames = 3;
  let minConfidence = 85;
  let maxStdDev = 5;
  let maxGapFromTraining = 15;
  let mode = 'NORMAL';

  if (trainingScore && trainingScore >= 90) {
    // STRICT MODE for high-quality training
    requiredFrames = 5;
    minConfidence = 85;
    maxStdDev = 3;
    maxGapFromTraining = 10;
    mode = 'STRICT';
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🔒 MODE: ${mode}`);
  console.log(`📊 Training score: ${trainingScore || 'N/A'}%`);
  console.log(`📋 Required frames: ${requiredFrames}`);
  console.log(`📏 Min confidence: ${minConfidence}%`);
  console.log(`📐 Max StdDev: ${maxStdDev}%`);
  console.log(`📏 Max gap from training: ${maxGapFromTraining}%`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // Collect good frames
  const goodFrames: { similarity: number; confidence: number; descriptor: Float32Array }[] = [];
  let isAnalyzing = true;
  let currentFrameIndex = 0;
  let bestSimilarity = 0;
  let bestConfidence = 0;

  const analyzeFrame = async () => {
    if (!isAnalyzing) return;

    try {
      onProgress(`🔍 Frame ${currentFrameIndex + 1}/${requiredFrames}...`, 0);

      // REAL face detection
      const result = await analyzeVideoFrame(video);
    
      if (result.detected && result.descriptor) {
        // REAL face comparison
        const similarity = compareFaceDescriptors(storedDescriptor, result.descriptor);

        // Check if this is a good frame
        if (result.confidence >= minConfidence && similarity >= threshold - 10) {
          // ✅ GOOD FRAME!
          console.log(`✅ FRAME ${currentFrameIndex + 1}/${requiredFrames} CAPTURED! Confidence: ${result.confidence}%, Similarity: ${similarity}%`);
          
          goodFrames.push({
            similarity,
            confidence: result.confidence,
            descriptor: result.descriptor
          });

          // Track best
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
            bestConfidence = result.confidence;
          }

          currentFrameIndex++;

          // ⚡ Check if we have all frames
          if (goodFrames.length >= requiredFrames) {
            // ✅ ALL FRAMES COLLECTED!
            isAnalyzing = false;

            // Calculate statistics
            const similarities = goodFrames.map(f => f.similarity);
            const confidences = goodFrames.map(f => f.confidence);
            const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
            const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
            
            // Calculate StdDev for similarity
            const variance = similarities.reduce((sum, val) => sum + Math.pow(val - avgSimilarity, 2), 0) / similarities.length;
            const stdDev = Math.sqrt(variance);

            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`🎉 ALL ${requiredFrames} FRAMES CAPTURED!`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📊 Similarities: [${similarities.join(', ')}]`);
            console.log(`📊 Average similarity: ${avgSimilarity.toFixed(1)}%`);
            console.log(`📊 Best similarity: ${bestSimilarity}%`);
            console.log(`📊 StdDev: ${stdDev.toFixed(2)}%`);

            // ⚡ VALIDATION CHECKS
            let passed = true;
            let failReason = '';

            // CHECK #1: Consistency
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📊 CHECK #1: Consistency`);
            if (stdDev <= maxStdDev) {
              console.log(`✅ PASS! StdDev ${stdDev.toFixed(2)}% <= ${maxStdDev}%`);
            } else {
              console.warn(`❌ FAIL! StdDev ${stdDev.toFixed(2)}% > ${maxStdDev}%`);
              passed = false;
              failReason = 'Inconsistent similarity - possible spoofing';
            }

            // CHECK #2: Threshold
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📊 CHECK #2: Threshold`);
            if (avgSimilarity >= threshold) {
              console.log(`✅ PASS! Average ${avgSimilarity.toFixed(1)}% >= ${threshold}%`);
            } else {
              console.warn(`❌ FAIL! Average ${avgSimilarity.toFixed(1)}% < ${threshold}%`);
              passed = false;
              failReason = 'Similarity below threshold';
            }

            // CHECK #3: Training Score Gap (if available)
            if (trainingScore && passed) {
              console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
              console.log(`📊 CHECK #3: Training Score Gap`);
              const gap = Math.abs(avgConfidence - trainingScore);
              console.log(`Training score: ${trainingScore}%`);
              console.log(`Current avg confidence: ${avgConfidence.toFixed(1)}%`);
              console.log(`Gap: ${gap.toFixed(1)}%`);
              
              if (gap <= maxGapFromTraining) {
                console.log(`✅ PASS! Gap ${gap.toFixed(1)}% <= ${maxGapFromTraining}%`);
      } else {
                console.warn(`⚠️ WARNING! Gap ${gap.toFixed(1)}% > ${maxGapFromTraining}%`);
                // Don't fail, just warn (gap check is supplementary)
              }
            }

            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            if (passed) {
              console.log(`✅ ALL CHECKS PASSED!`);
              console.log(`🎯 Best similarity: ${bestSimilarity}%`);
              console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
              onComplete(true, bestSimilarity, bestConfidence);
            } else {
              console.warn(`❌ VERIFICATION FAILED!`);
              console.warn(`Reason: ${failReason}`);
              console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
              onComplete(false, avgSimilarity, avgConfidence);
            }
            return;
          }

          // ⏸️ Pause before next frame
          console.log(`⏸️ Pausing 300ms before next frame...`);
          await new Promise(resolve => setTimeout(resolve, 300));
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          console.log(`🎯 FRAME ${currentFrameIndex + 1}/${requiredFrames}`);
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        } else {
          // Frame not good enough
          console.log(`🔄 Loading... Confidence: ${result.confidence}%, Similarity: ${similarity}%`);
          onProgress(`🔄 Analyzing... ${result.confidence}%`, result.confidence);
        }
      } else {
        // No face detected
        console.log(`👤 No face detected...`);
        onProgress('👤 Arahkan wajah ke kotak...', 0);
      }

      // Continue loop
      if (isAnalyzing) {
    requestAnimationFrame(analyzeFrame);
      }
    } catch (error: any) {
      console.error('❌ Verification error:', error);
      isAnalyzing = false;
      onComplete(false, 0, 0);
    }
  };

  // Start with first frame header
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎯 FRAME 1/${requiredFrames}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  analyzeFrame();

  // Timeout safety
  setTimeout(() => {
    if (isAnalyzing) {
      isAnalyzing = false;
      console.warn(`⏰ Verification timeout!`);
      if (bestSimilarity > 0) {
        console.log(`✅ Using best result: ${bestSimilarity}%`);
        onComplete(bestSimilarity >= threshold, bestSimilarity, bestConfidence);
      } else {
        onComplete(false, 0, 0);
      }
    }
  }, 10000); // 10 seconds max
}

/**
 * REAL face verification using face-api.js (OLD - for backward compatibility)
 * Compares live face with stored 128D face descriptor
 */
export async function performRealTimeVerification(
  video: HTMLVideoElement,
  storedEncoding: string,
  onProgress: (confidence: number, similarity: number) => void,
  onComplete: (success: boolean, finalConfidence: number, similarity: number) => void
): Promise<void> {
  console.log(`🎯 [DEPRECATED] Using old real-time verification, use performInstantVerification instead`);
  
  // Redirect to instant verification with adapter
  await performInstantVerification(
    video,
    storedEncoding,
    (status: string, confidence: number) => {
      // Adapter: convert new format to old format
      onProgress(confidence, 0); // similarity not available in progress
    },
    (success: boolean, similarity: number, confidence: number) => {
      onComplete(success, confidence, similarity);
    }
  );
}

/**
 * Get system settings (for backward compatibility)
 */
export async function getSystemSettings() {
  try {
    const response = await fetch('/api/system-settings', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    const data = await response.json();
    
    if (data.success) {
      return { 
        faceThreshold: parseInt(data.data.face_recognition_threshold?.value || '80'),
        gpsRadius: parseInt(data.data.gps_accuracy_radius?.value || '3000')
      };
    }
  } catch (error) {
    console.error('Error fetching system settings:', error);
  }
  
  // Default settings
  return { 
    faceThreshold: 80,
    gpsRadius: 3000
  };
}
