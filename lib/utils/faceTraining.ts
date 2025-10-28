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
  let stableFrames = 0;
  const requiredStableFrames = 15; // Need 15 stable frames for reliable training
  const targetConfidence = 85; // Minimum 85% confidence from face detection

  console.log(`🎯 Starting REAL face training for: ${stepInstruction}`);
  console.log(`📋 Requirements: ${requiredStableFrames} stable frames at ${targetConfidence}% confidence`);

  // Ensure models are loaded before starting
  const modelsReady = await loadFaceModels();
  if (!modelsReady) {
    onError('Gagal memuat model AI. Silakan refresh halaman dan coba lagi.');
    return;
  }

  const analyzeFrame = async () => {
    if (!isAnalyzing) return;

    try {
      // REAL face detection
      const result = await analyzeVideoFrame(video);
      
      if (result.error) {
        isAnalyzing = false;
        onError(result.error);
        return;
      }

      // Update progress with REAL confidence
    onProgress(result.confidence);

      if (result.detected && result.descriptor) {
        // Track best detection
        if (result.confidence > bestConfidence) {
          bestConfidence = result.confidence;
          bestDescriptor = result.descriptor;
        }

        // Check if we have stable high-quality detection
    if (result.confidence >= targetConfidence) {
      stableFrames++;
      console.log(`✅ Stable frame ${stableFrames}/${requiredStableFrames} - Confidence: ${result.confidence}%`);
      
      if (stableFrames >= requiredStableFrames) {
        isAnalyzing = false;
            
            if (bestDescriptor) {
              // Serialize descriptor for storage
              const encoding = serializeDescriptor(bestDescriptor);
              console.log(`🎉 Training completed! Confidence: ${bestConfidence}%`);
              console.log(`📊 Descriptor size: ${bestDescriptor.length} dimensions`);
              onComplete(encoding, bestConfidence);
            } else {
              onError('Gagal mendapatkan data wajah');
            }
        return;
      }
    } else {
          // Reset if confidence drops below threshold
          if (stableFrames > 0) {
            console.log(`⚠️ Confidence dropped to ${result.confidence}%, resetting stable frames`);
          }
          stableFrames = 0;
        }
      } else {
        // No face detected, reset counter
        if (stableFrames > 0) {
          console.log('⚠️ Face lost, resetting stable frames');
        }
        stableFrames = 0;
    }

    // Continue analyzing
    requestAnimationFrame(analyzeFrame);
    } catch (error: any) {
      console.error('❌ Frame analysis error:', error);
      isAnalyzing = false;
      onError(`Error: ${error.message}`);
    }
  };

  // Start analysis
  analyzeFrame();

  // Timeout after 45 seconds
  setTimeout(() => {
    if (isAnalyzing) {
      isAnalyzing = false;
      if (bestDescriptor && bestConfidence >= 70) {
        console.log(`⏰ Training timeout, using best result: ${bestConfidence}%`);
        const encoding = serializeDescriptor(bestDescriptor);
        onComplete(encoding, bestConfidence);
      } else {
        onError(
          `Training timeout!\n\n` +
          `Confidence terbaik: ${bestConfidence}%\n` +
          `Minimum required: 70%\n\n` +
          `Tips:\n` +
          `- Pastikan wajah terlihat jelas\n` +
          `- Cukup cahaya\n` +
          `- Ikuti instruksi dengan tepat`
        );
      }
    }
  }, 45000);
}

/**
 * REAL face verification using face-api.js
 * Compares live face with stored 128D face descriptor
 */
export async function performRealTimeVerification(
  video: HTMLVideoElement,
  storedEncoding: string,
  onProgress: (confidence: number, similarity: number) => void,
  onComplete: (success: boolean, finalConfidence: number, similarity: number) => void
): Promise<void> {
  let isAnalyzing = true;
  let bestSimilarity = 0;
  let bestConfidence = 0;
  let stableFrames = 0;
  const requiredStableFrames = 10; // Need 10 stable frames for verification
  
  console.log(`🎯 Starting REAL face verification`);

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

  // Fetch threshold from API
  let threshold = 80; // default
  try {
    const response = await fetch('/api/system-settings');
    const data = await response.json();
    if (data.success) {
      threshold = parseInt(data.data.face_recognition_threshold?.value || '80');
      console.log(`⚙️ Using threshold from database: ${threshold}%`);
    }
  } catch (error) {
    console.log('⚠️ Using default threshold: 80%');
  }

  const analyzeFrame = async () => {
    if (!isAnalyzing) return;

    try {
      // REAL face detection
      const result = await analyzeVideoFrame(video);
    
      if (result.detected && result.descriptor) {
        // REAL face comparison using euclidean distance
        const similarity = compareFaceDescriptors(storedDescriptor, result.descriptor);
      
        // Track best match
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
          bestConfidence = result.confidence;
      }

        // Always update progress (UI feedback)
      onProgress(result.confidence, similarity);

        // Check if verification passes threshold
      if (similarity >= threshold) {
        stableFrames++;
        
        if (stableFrames >= requiredStableFrames) {
          isAnalyzing = false;
            console.log(`🎉 VERIFICATION SUCCESS! Similarity: ${bestSimilarity}% (threshold: ${threshold}%)`);
            onComplete(true, bestConfidence, bestSimilarity);
          return;
        }
      } else {
          // Reset if similarity drops below threshold
          stableFrames = 0;
      }
      } else {
        // No face detected - reset but don't spam console
        stableFrames = 0;
        onProgress(0, 0);
    }

      // Continue analyzing next frame
    requestAnimationFrame(analyzeFrame);
    } catch (error: any) {
      console.error('❌ Verification frame error:', error);
      isAnalyzing = false;
      onComplete(false, 0, 0);
    }
  };

  // Start analysis
  analyzeFrame();

  // Timeout after 20 seconds
  setTimeout(() => {
    if (isAnalyzing) {
      isAnalyzing = false;
      console.log(`⏰ Verification timeout - Best similarity: ${bestSimilarity}%`);
      onComplete(bestSimilarity >= threshold, bestConfidence, bestSimilarity);
    }
  }, 20000);
}

/**
 * Get system settings (for backward compatibility)
 */
export async function getSystemSettings() {
  try {
    const response = await fetch('/api/system-settings');
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
