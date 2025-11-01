'use client';

import { useEffect, useState } from 'react';

interface ErrorNotificationProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function ErrorNotification({
  isOpen,
  message,
  onClose
}: ErrorNotificationProps) {
  const [show, setShow] = useState(false);
  const [showXmark, setShowXmark] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 50);
      setTimeout(() => setShowXmark(true), 200);
      // Auto close after 1.5 seconds
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          onClose();
        }, 200);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      setShowXmark(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div 
      className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-all duration-200 ${
        show ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-xs w-full overflow-hidden transition-all duration-300 transform ${
          show ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-2'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Top Right */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-all z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-6 py-6 flex flex-col items-center gap-4">
          {/* Large Animated X Icon - Semi-transparent */}
          <div className={`relative transition-all duration-500 ${
            showXmark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}>
            <div className="relative">
              {/* Animated Ring */}
              <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30"></div>
              {/* Large X Icon - Semi-transparent */}
              <div className="relative">
                <svg 
                  className="w-20 h-20 sm:w-24 sm:h-24 text-red-500 opacity-70" 
                  viewBox="0 0 52 52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle 
                    cx="26" 
                    cy="26" 
                    r="25"
                    fill="none"
                    style={{
                      strokeDasharray: '166',
                      strokeDashoffset: showXmark ? '0' : '166',
                      transition: 'stroke-dashoffset 0.6s ease-in-out 0.2s'
                    }}
                  />
                  <path 
                    fill="none"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    d="M16 16l20 20"
                    style={{
                      strokeDasharray: '28',
                      strokeDashoffset: showXmark ? '0' : '28',
                      transition: 'stroke-dashoffset 0.4s ease-in-out 0.6s'
                    }}
                  />
                  <path 
                    fill="none"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    d="M36 16l-20 20"
                    style={{
                      strokeDasharray: '28',
                      strokeDashoffset: showXmark ? '0' : '28',
                      transition: 'stroke-dashoffset 0.4s ease-in-out 0.8s'
                    }}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="text-center">
            <p className="text-sm sm:text-base font-medium text-slate-800 leading-tight px-2">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

