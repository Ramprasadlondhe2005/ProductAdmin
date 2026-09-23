'use client';

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Trash2, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'danger' | 'info';
  title: string;
  description?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';
  const isDanger = toast.type === 'danger';

  return (
    <div
      className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all transform animate-fade-in ${
        isSuccess
          ? 'bg-emerald-950/90 border-emerald-700/80 text-emerald-100 shadow-emerald-950/60'
          : isDanger
          ? 'bg-rose-950/90 border-rose-700/80 text-rose-100 shadow-rose-950/60'
          : 'bg-sky-950/90 border-sky-700/80 text-sky-100 shadow-sky-950/60'
      }`}
    >
      <div className="shrink-0 pt-0.5">
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : isDanger ? (
          <Trash2 className="w-5 h-5 text-rose-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-sky-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold tracking-wide capitalize">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-xs mt-0.5 opacity-90 leading-relaxed text-slate-200">
            {toast.description}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-1 text-slate-400 hover:text-slate-100 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ToastContainer;
