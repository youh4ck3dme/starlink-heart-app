import { useState, useCallback } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

// Simple toast state - in production you'd use a context
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

const notifyListeners = () => {
  toastListeners.forEach(listener => listener([...toasts]));
};

export function useToast() {
  const [, setUpdate] = useState(0);

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: Toast = { ...options, id };
    
    toasts = [...toasts, newToast];
    notifyListeners();

    // Auto-dismiss after duration
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notifyListeners();
    }, options.duration || 4000);

    // Also show as alert for simplicity (remove in production)
    console.log(`[Toast] ${options.title}: ${options.description || ''}`);
    
    return { id, dismiss: () => {
      toasts = toasts.filter(t => t.id !== id);
      notifyListeners();
    }};
  }, []);

  return { toast };
}
