import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

type ToastType = 'goal' | 'yellow' | 'red' | 'substitution' | 'info' | 'success';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  team?: 'home' | 'away';
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
  removeToast: () => {},
  toasts: [],
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++idCounter.current}-${Date.now()}`;
    setToasts((prev) => [...prev.slice(-4), { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

const TOAST_ICONS: Record<ToastType, string> = {
  goal: '⚽',
  yellow: '🟨',
  red: '🟥',
  substitution: '🔄',
  info: 'ℹ️',
  success: '✅',
};

const TOAST_COLORS: Record<ToastType, string> = {
  goal: 'border-green-500/40 bg-green-500/10',
  yellow: 'border-yellow-500/40 bg-yellow-500/10',
  red: 'border-red-600/40 bg-red-600/10',
  substitution: 'border-blue-500/40 bg-blue-500/10',
  info: 'border-ahly-gold/40 bg-ahly-gold/10',
  success: 'border-green-500/40 bg-green-500/10',
};

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-up ${TOAST_COLORS[toast.type]} bg-ahly-dark/90 max-w-xs md:max-w-sm`}
        >
          <span className="text-lg shrink-0">{TOAST_ICONS[toast.type]}</span>
          <p className="text-xs md:text-sm text-white font-medium leading-snug">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-auto shrink-0 text-ahly-muted/50 hover:text-white transition-colors text-sm leading-none"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
