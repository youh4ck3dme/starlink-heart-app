import { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

const variantStyles = {
  default: {
    bg: 'bg-white border-gray-200',
    icon: Info,
    iconColor: 'text-blue-500',
  },
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: AlertCircle,
    iconColor: 'text-red-600',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  info: {
    bg: 'bg-sky-50 border-sky-200',
    icon: Info,
    iconColor: 'text-sky-600',
  },
};

export function Toast({ id, title, description, variant = 'default', onClose }: ToastProps) {
  const style = variantStyles[variant];
  const Icon = style.icon;

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`
        ${style.bg} 
        border-2 rounded-2xl shadow-xl p-4 
        min-w-[320px] max-w-[420px]
        animate-in slide-in-from-top-5 fade-in duration-300
        motion-reduce:animate-none
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <Icon className={`${style.iconColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">{title}</p>
          {description && (
            <p className="text-gray-600 text-xs mt-1 leading-relaxed">{description}</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100/50"
          aria-label="Zavrieť notifikáciu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
