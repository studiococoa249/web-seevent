"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Overlay Container - Moved to TOP right */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let accentBorder = 'border-l-4 border-l-emerald-600';
          let icon = 'fa-solid fa-circle-info text-emerald-600';
          
          if (t.type === 'success') {
            accentBorder = 'border-l-4 border-l-emerald-600 bg-white';
            icon = 'fa-solid fa-circle-check text-emerald-600';
          } else if (t.type === 'error') {
            accentBorder = 'border-l-4 border-l-red-600 bg-white';
            icon = 'fa-solid fa-circle-exclamation text-red-600';
          } else if (t.type === 'warning') {
            accentBorder = 'border-l-4 border-l-amber-500 bg-white';
            icon = 'fa-solid fa-triangle-exclamation text-amber-500';
          } else if (t.type === 'info') {
            accentBorder = 'border-l-4 border-l-sky-500 bg-white';
            icon = 'fa-solid fa-circle-info text-sky-500';
          }

          return (
            <div
              key={t.id}
              className={`flex items-center gap-3.5 px-4.5 py-4 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/80 animate-fade-in pointer-events-auto transition-all ${accentBorder}`}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-50 shrink-0">
                <i className={`${icon} text-sm`}></i>
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold leading-normal text-slate-700">{t.message}</span>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="text-slate-400 hover:text-slate-600 text-xs transition-colors shrink-0 pl-2"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
