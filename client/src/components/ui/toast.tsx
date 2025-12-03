import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  variant?: 'error' | 'success' | 'info';
}

export function Toast({ message, onClose, variant = 'error' }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md px-4 py-3 shadow-lg',
        {
          'bg-destructive text-destructive-foreground': variant === 'error',
          'bg-green-600 text-white': variant === 'success',
          'bg-blue-600 text-white': variant === 'info',
        }
      )}
    >
      <p className="text-sm">{message}</p>
      <button
        onClick={onClose}
        className="rounded-full p-1 hover:bg-black/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = React.useState<{
    message: string;
    variant: 'error' | 'success' | 'info';
  } | null>(null);

  const showToast = React.useCallback(
    (message: string, variant: 'error' | 'success' | 'info' = 'error') => {
      setToast({ message, variant });
    },
    []
  );

  const hideToast = React.useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
}
