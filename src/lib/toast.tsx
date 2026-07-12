import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; type: ToastType }

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm text-white animate-[slideIn_0.2s_ease] ${
              t.type === 'success'
                ? 'bg-emerald-600'
                : t.type === 'error'
                  ? 'bg-rose-600'
                  : 'bg-slate-800'
                }`}
          >
            {t.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : t.type === 'error' ? (
              <XCircle size={18} className="shrink-0" />
            ) : (
              <Info size={18} className="shrink-0" />
            )}
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}
