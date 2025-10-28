'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  getCameraStream, 
  stopCameraStream, 
  performRealTimeVerification
} from '@/lib/utils/faceTraining';

interface FaceVerificationCameraProps {
  storedFaceEncoding: string;
  trainingScore?: number; // Training score from employee data
  onVerificationComplete: (result: { 
    success: boolean; 
    score: number; 
    trainingScore?: number;
    threshold?: number;
    image?: string; 
    error?: string 
  }) => void;
  onClose: () => void;
}

export default function FaceVerificationCamera({ 
  storedFaceEncoding,
  trainingScore,
  onVerificationComplete, 
  onClose 
}: FaceVerificationCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [currentSimilarity, setCurrentSimilarity] = useState(0);
  const [threshold, setThreshold] = useState<number>(80); // Default threshold

  // Fetch system settings (threshold) on mount
  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const response = await fetch('/api/system-settings');
        const data = await response.json();
        
        if (data.success) {
          const faceThreshold = parseInt(data.data.face_recognition_threshold?.value || '80');
          setThreshold(faceThreshold);
          console.log('🔧 [VERIFICATION] Loaded threshold from DB:', faceThreshold);
        }
      } catch (error) {
        console.error('Error fetching system settings:', error);
        // Keep default threshold of 80
      }
    };

    fetchSystemSettings();
  }, []);

  useEffect(() => {
    // Wait for video element to be available (same logic as FaceTrainingCamera)
    const checkVideoElement = () => {
      console.log('🔍 [VERIFICATION] Checking video element availability...');
      console.log('📺 [VERIFICATION] videoRef.current exists:', !!videoRef.current);
      
      if (videoRef.current) {
        console.log('✅ [VERIFICATION] Video element found, starting camera...');
        startCamera();
      } else {
        console.log('⏳ [VERIFICATION] Video element not ready, retrying in 200ms...');
        setTimeout(checkVideoElement, 200);
      }
    };

    // Start checking after a small delay
    const timer = setTimeout(checkVideoElement, 50);

    return () => {
      clearTimeout(timer);
      if (stream) {
        console.log('🛑 Stopping verification camera stream on unmount');
        stopCameraStream(stream);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      console.log('🎥 [VERIFICATION] Starting face verification camera...');
      console.log('📺 [VERIFICATION] Video element check - exists:', !!videoRef.current);
      console.log('📺 [VERIFICATION] Video element details:', {
        current: videoRef.current,
        nodeName: videoRef.current?.nodeName,
        readyState: videoRef.current?.readyState
      });
      
      setIsLoading(true);
      setError(null);

      // Double check video element (same as FaceTrainingCamera)
      if (!videoRef.current) {
        console.error('❌ [VERIFICATION] Video element STILL not found after waiting!');
        setError('Video element tidak tersedia setelah menunggu');
        setIsLoading(false);
        return;
      }

      console.log('📷 [VERIFICATION] Requesting camera stream...');
      const cameraStream = await getCameraStream();
      console.log('📷 [VERIFICATION] Camera stream result:', !!cameraStream);
      
      if (!cameraStream) {
        throw new Error('Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.');
      }

      console.log('📺 [VERIFICATION] Setting video source...');
      videoRef.current.srcObject = cameraStream;
      setStream(cameraStream);
      
      // Try to play the video immediately (same as FaceTrainingCamera)
      try {
        await videoRef.current.play();
        console.log('▶️ [VERIFICATION] Video playing immediately, camera ready!');
        setIsLoading(false);
      } catch (playError) {
        console.log('⚠️ [VERIFICATION] Immediate play failed, waiting for metadata...', playError);
        // Fallback: wait for metadata
        videoRef.current.onloadedmetadata = async () => {
          console.log('✅ [VERIFICATION] Video metadata loaded via JS event');
          try {
            await videoRef.current?.play();
            console.log('▶️ [VERIFICATION] Video playing after metadata, camera ready!');
            setIsLoading(false);
          } catch (playError2) {
            console.error('❌ [VERIFICATION] Video play error after metadata:', playError2);
            setIsLoading(false);
          }
        };
        
        // Final timeout fallback
        setTimeout(() => {
          console.log('⏰ [VERIFICATION] Video loading timeout, forcing ready state');
          setIsLoading(false);
        }, 3000);
      }
    } catch (err: any) {
      console.error('❌ [VERIFICATION] Camera error:', err);
      setError(err.message || 'Gagal menginisialisasi kamera');
      setIsLoading(false);
    }
  };

  // Removed auto-start - user must click "Mulai Verifikasi" button

  const startRealTimeVerification = async () => {
    if (!videoRef.current) {
      console.error('❌ Video element not found');
      setError('Video element tidak tersedia');
      return;
    }
    
    if (isVerifying) {
      console.warn('⚠️ Verification already in progress');
      return;
    }

    console.log('✅ [VERIFICATION] Starting verification...');
    setIsVerifying(true);
    setCurrentConfidence(0);
    setCurrentSimilarity(0);
    setError(null);

    try {
      await performRealTimeVerification(
        videoRef.current,
        storedFaceEncoding,
        // onProgress callback - Update UI in real-time
        (confidence: number, similarity: number) => {
          console.log(`📊 Progress: confidence=${confidence}%, similarity=${similarity}%`);
          setCurrentConfidence(Math.round(confidence));
          setCurrentSimilarity(Math.round(similarity));
        },
        // onComplete callback
        (success: boolean, finalConfidence: number, finalSimilarity: number) => {
          console.log(`🎯 Verification complete: ${success ? 'SUCCESS' : 'FAILED'}`);
          console.log(`📊 Final: similarity=${finalSimilarity}%, threshold=${threshold}%`);
          
          setIsVerifying(false);
          
          // Stop camera
          if (stream) {
            stopCameraStream(stream);
            setStream(null);
          }
          
          // Pass result to parent
          onVerificationComplete({
            success: finalSimilarity >= threshold,
            score: Math.round(finalSimilarity),
            trainingScore: trainingScore,
            threshold: threshold,
            error: finalSimilarity < threshold ? `Skor verifikasi (${Math.round(finalSimilarity)}%) di bawah threshold (${threshold}%)` : undefined
          });
        }
      );
    } catch (error: any) {
      console.error('❌ Verification error:', error);
      setIsVerifying(false);
      
      if (stream) {
        stopCameraStream(stream);
        setStream(null);
      }
      
      onVerificationComplete({
        success: false,
        score: 0,
        trainingScore: trainingScore,
        threshold: threshold,
        error: `Error: ${error.message || 'Verification failed'}`
      });
    }
  };

  // Always render the main modal, but show loading overlay when needed (same as FaceTrainingCamera)

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Verifikasi Wajah</h2>
          <button
            onClick={() => {
              console.log('🔴 Closing verification modal, stopping stream');
              if (stream) {
                stopCameraStream(stream);
              }
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Verifikasi Wajah Real-time
          </h3>
          {!isVerifying ? (
            <p className="text-gray-600 text-sm">
              Pastikan wajah Anda terlihat jelas, lalu tekan tombol <span className="font-semibold">"Mulai Verifikasi"</span>.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">
                Lihat ke kamera dan tunggu verifikasi selesai
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Skor Verifikasi:</span>
                  <span className="text-xl font-bold text-blue-600">{currentSimilarity}%</span>
                </div>
                {trainingScore !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Skor Training:</span>
                    <span className="text-sm font-semibold text-green-600">{trainingScore}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Threshold:</span>
                  <span className="text-sm font-semibold text-purple-600">{threshold}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Confidence:</span>
                  <span className="text-sm font-semibold text-gray-700">{currentConfidence}%</span>
                </div>
                <div className="pt-1 border-t border-gray-200">
                  <span className={`text-xs font-bold ${currentSimilarity >= threshold ? 'text-green-600' : 'text-orange-500'}`}>
                    {currentSimilarity >= threshold ? '✅ LULUS - Pertahankan!' : '⏳ Terus lihat ke kamera...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Camera */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full"
            style={{ maxHeight: '300px' }}
            onLoadedMetadata={() => {
              console.log('📺 [VERIFICATION] Video metadata loaded in JSX');
              setIsLoading(false);
            }}
          />
          
          {/* Loading overlay (same as FaceTrainingCamera) */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Memuat kamera...</p>
                <p className="text-sm mt-2 opacity-75">Pastikan izin kamera sudah diberikan</p>
              </div>
            </div>
          )}
          
          {/* Real-time Verification Circle */}
          {isVerifying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Progress Circle */}
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background Circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    fill="rgba(0,0,0,0.5)"
                  />
                  {/* Similarity Circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke={currentSimilarity >= threshold ? "#10B981" : currentSimilarity >= 50 ? "#F59E0B" : "#3B82F6"}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - currentSimilarity / 100)}`}
                    className="transition-all duration-200"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white drop-shadow-lg">
                    <div className="text-2xl font-bold">{currentSimilarity}%</div>
                    <div className="text-xs mt-1">
                      {currentSimilarity >= threshold ? "✅ LULUS" : currentSimilarity >= 50 ? "⏳ HAMPIR" : "📊 SCAN"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Face guide */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-52 border-2 border-white rounded-lg" />
          </div>
        </div>

        {/* Action Button */}
        {isVerifying ? (
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl text-center shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span className="text-base font-bold">Memverifikasi... {currentSimilarity}%</span>
            </div>
            <div className="mt-1 text-xs text-white/90">
              Tetap lihat ke kamera
            </div>
          </div>
        ) : (
          <button
            onClick={startRealTimeVerification}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg">Mulai Verifikasi</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
