'use client';

import { useEffect, useState } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  requireConfirmText?: string; // Teks yang harus diketik untuk konfirmasi (opsional)
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  requireConfirmText,
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  const [show, setShow] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 50);
    } else {
      setShow(false);
      setConfirmInput(''); // Reset input saat modal ditutup
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCancel = () => {
    setShow(false);
    setTimeout(() => {
      onCancel();
    }, 200);
  };

  const handleConfirm = () => {
    // Validasi jika requireConfirmText ada
    if (requireConfirmText && confirmInput !== requireConfirmText) {
      return; // Tidak lanjut jika teks tidak sesuai
    }
    setShow(false);
    setConfirmInput('');
    setTimeout(() => {
      onConfirm();
    }, 200);
  };

  const isConfirmDisabled = requireConfirmText ? confirmInput !== requireConfirmText : false;

  return (
    <div 
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-200 ${
        show ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleCancel}
    >
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-xs w-full overflow-hidden transition-all duration-300 transform ${
          show ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-2'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Top Right */}
        <button
          onClick={handleCancel}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-all z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-6 py-6 flex flex-col items-center gap-4">
          {/* Warning Icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30"></div>
            <div className="relative">
              <svg 
                className="w-20 h-20 sm:w-24 sm:h-24 text-red-500 opacity-70" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle 
                  cx="12" 
                  cy="12" 
                  r="10"
                  className="fill-red-100 opacity-50"
                />
                <path d="M12 9v4" strokeLinecap="round" />
                <path d="M12 17h.01" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              {title}
            </h3>
            <div className="text-sm text-slate-600 leading-tight px-2 whitespace-pre-line">
              {message}
            </div>
          </div>

          {/* Confirm Input (if required) */}
          {requireConfirmText && (
            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                Ketik <span className="text-red-600 font-bold">"{requireConfirmText}"</span> untuk konfirmasi:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={`Ketik "${requireConfirmText}"`}
                className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm text-center font-medium"
                autoFocus
              />
            </div>
          )}

          {/* Buttons */}
          <div className="w-full flex gap-3 mt-2">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all text-sm"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className={`flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg text-sm ${
                isConfirmDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

