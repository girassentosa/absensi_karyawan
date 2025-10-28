'use client';

import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load face-api.js models
 * Models must be in /public/models folder
 */
export async function loadFaceModels(): Promise<boolean> {
  if (modelsLoaded) {
    console.log('✅ Models already loaded');
    return true;
  }

  try {
    console.log('📦 Loading face-api.js models...');
    
    const MODEL_URL = '/models';
    
    // Load all required models in parallel
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    
    modelsLoaded = true;
    console.log('✅ All face-api.js models loaded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error loading face-api.js models:', error);
    console.error('📋 Make sure model files are in /public/models folder');
    console.error('📋 Download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights');
    return false;
  }
}

/**
 * Check if models are loaded
 */
export function areModelsLoaded(): boolean {
  return modelsLoaded;
}

/**
 * Detect face in video element and extract 128D descriptor
 * Returns null if no face detected
 */
export async function detectFaceAndGetDescriptor(
  input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<{ descriptor: Float32Array; detection: faceapi.FaceDetection; confidence: number } | null> {
  try {
    if (!modelsLoaded) {
      console.error('❌ Models not loaded yet');
      return null;
    }

    // Detect face with landmarks and descriptor
    const detection = await faceapi
      .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.5
      }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return null;
    }

    return {
      descriptor: detection.descriptor,
      detection: detection.detection,
      confidence: Math.round(detection.detection.score * 100)
    };
  } catch (error) {
    console.error('❌ Error detecting face:', error);
    return null;
  }
}

/**
 * Calculate euclidean distance between two face descriptors
 * Lower distance = more similar faces
 * Returns distance value (0 = identical, higher = more different)
 */
export function calculateFaceDistance(descriptor1: Float32Array, descriptor2: Float32Array): number {
  return faceapi.euclideanDistance(descriptor1, descriptor2);
}

/**
 * Calculate similarity percentage from euclidean distance
 * 0% = completely different, 100% = identical
 */
export function distanceToSimilarity(distance: number): number {
  // Typical distance for same person: 0.4 - 0.6
  // Typical distance for different person: 0.6+
  // We'll use 0.6 as threshold
  
  if (distance <= 0.4) {
    // Very similar - map 0.0-0.4 to 90-100%
    return Math.round(90 + (0.4 - distance) / 0.4 * 10);
  } else if (distance <= 0.6) {
    // Somewhat similar - map 0.4-0.6 to 70-90%
    return Math.round(70 + (0.6 - distance) / 0.2 * 20);
  } else if (distance <= 0.8) {
    // Different - map 0.6-0.8 to 40-70%
    return Math.round(40 + (0.8 - distance) / 0.2 * 30);
  } else {
    // Very different - map 0.8-1.2 to 0-40%
    const similarity = Math.max(0, 40 - (distance - 0.8) / 0.4 * 40);
    return Math.round(similarity);
  }
}

/**
 * Compare two face descriptors and return similarity percentage
 */
export function compareFaceDescriptors(descriptor1: Float32Array, descriptor2: Float32Array): number {
  const distance = calculateFaceDistance(descriptor1, descriptor2);
  const similarity = distanceToSimilarity(distance);
  
  console.log(`📊 Face comparison - Distance: ${distance.toFixed(3)}, Similarity: ${similarity}%`);
  
  return similarity;
}

/**
 * Serialize descriptor to string for storage
 */
export function serializeDescriptor(descriptor: Float32Array): string {
  return JSON.stringify(Array.from(descriptor));
}

/**
 * Deserialize descriptor from string
 * Supports both old format (multiple descriptors) and new format (single averaged descriptor)
 */
export function deserializeDescriptor(serialized: string): Float32Array {
  try {
    // Check if it's old format with multiple descriptors (contains "|")
    if (serialized.includes('|')) {
      console.log('⚠️ Old format detected (multiple descriptors), averaging...');
      
      // Split and parse each descriptor
      const parts = serialized.split('|');
      const descriptors = parts.map(part => {
        const array = JSON.parse(part);
        return new Float32Array(array);
      });
      
      // Average them
      return averageDescriptors(descriptors);
    }
    
    // New format - single descriptor
    const array = JSON.parse(serialized);
    return new Float32Array(array);
  } catch (error) {
    console.error('❌ Error deserializing descriptor:', error);
    console.error('Serialized data:', serialized.substring(0, 100) + '...');
    throw new Error('Invalid face descriptor format');
  }
}

/**
 * Average multiple descriptors to create a robust face template
 */
export function averageDescriptors(descriptors: Float32Array[]): Float32Array {
  if (descriptors.length === 0) {
    throw new Error('No descriptors to average');
  }
  
  if (descriptors.length === 1) {
    return descriptors[0];
  }
  
  const avgDescriptor = new Float32Array(128);
  
  for (let i = 0; i < 128; i++) {
    let sum = 0;
    for (const descriptor of descriptors) {
      sum += descriptor[i];
    }
    avgDescriptor[i] = sum / descriptors.length;
  }
  
  return avgDescriptor;
}

/**
 * Draw face detection on canvas
 */
export function drawFaceDetection(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  detection: faceapi.FaceDetection
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Set canvas size to match video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // Draw face box
  const box = detection.box;
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 3;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
  
  // Draw confidence score
  ctx.fillStyle = '#00ff00';
  ctx.font = '16px Arial';
  ctx.fillText(
    `${Math.round(detection.score * 100)}%`,
    box.x,
    box.y - 5
  );
}

