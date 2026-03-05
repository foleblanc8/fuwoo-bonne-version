// src/components/Toast.tsx
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToast, Toast as ToastItem, ToastType } from '../contexts/ToastContext';

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 shrink-0" />,
  error: <XCircle className="w-5 h-5 shrink-0" />,
  warning: <AlertCircle className="w-5 h-5 shrink-0" />,
  info: <Info className="w-5 h-5 shrink-0" />,
};

const colorMap: Record<ToastType, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-orange-500 text-white',
  info: 'bg-blue-600 text-white',
};

const ToastItem_: React.FC<{ toast: ToastItem }> = ({ toast }) => {
  const { removeToast } = useToast();
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-in ${colorMap[toast.type]}`}
      style={{ minWidth: '260px', maxWidth: '360px' }}
    >
      {iconMap[toast.type]}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100 transition ml-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end">
      {toasts.map(t => <ToastItem_ key={t.id} toast={t} />)}
    </div>
  );
};

export default ToastContainer;
