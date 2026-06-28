'use client';

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps extends Toast {
  onClose: (id: string) => void;
}

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={20} className="text-emerald-500" />;
    case 'error':
      return <AlertCircle size={20} className="text-red-500" />;
    case 'warning':
      return <AlertTriangle size={20} className="text-amber-500" />;
    case 'info':
    default:
      return <Info size={20} className="text-blue-500" />;
  }
};

const getStyles = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-950 border-emerald-900 text-emerald-100';
    case 'error':
      return 'bg-red-950 border-red-900 text-red-100';
    case 'warning':
      return 'bg-amber-950 border-amber-900 text-amber-100';
    case 'info':
    default:
      return 'bg-blue-950 border-blue-900 text-blue-100';
  }
};

export const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 4000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border animate-slide-in-right',
        getStyles(type)
      )}
    >
      {getIcon(type)}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="p-1 hover:bg-black/20 rounded transition-all"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: Toast[]; onClose: (id: string) => void }> = ({
  toasts,
  onClose,
}) => {
  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  );
};
