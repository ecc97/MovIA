"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idCounter = useRef(0);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = `toast-${++idCounter.current}`;
      setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), { id, message, variant }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), variant === "error" ? 6000 : 4000)
      );
    },
    [dismiss]
  );

  useEffect(() => {
    const running = timers.current;
    return () => {
      running.forEach((timer) => clearTimeout(timer));
      running.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (message) => toast(message, "success"),
      error: (message) => toast(message, "error"),
      info: (message) => toast(message, "info"),
      dismiss,
    }),
    [toast, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 left-4 right-4 z-[60] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-80"
      >
        {toasts.map((item) => {
          const Icon = item.variant === "error" ? AlertCircle : item.variant === "info" ? Info : CheckCircle2;
          const iconColor =
            item.variant === "error"
              ? "text-error"
              : item.variant === "info"
                ? "text-azul"
                : "text-exito";
          return (
            <div
              key={item.id}
              role={item.variant === "error" ? "alert" : "status"}
              className="pointer-events-auto flex items-start gap-3 rounded-card border border-gris-200 bg-blanco p-3 shadow-lg motion-safe:animate-[toast-in_180ms_ease-out]"
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${iconColor}`} aria-hidden="true" />
              <p className="flex-1 text-sm text-grafito">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Cerrar notificación"
                className="rounded-full p-0.5 text-gris-500 hover:bg-gris-100 focus:outline-none focus:ring-2 focus:ring-dorado"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
}
