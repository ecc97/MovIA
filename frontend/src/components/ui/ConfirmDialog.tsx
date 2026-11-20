"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        lastFocused.current = document.activeElement as HTMLElement | null;
        setPending({ ...options, resolve });
      }),
    []
  );

  const finish = useCallback(
    (value: boolean) => {
      if (!pending) return;
      pending.resolve(value);
      setPending(null);
      lastFocused.current?.focus();
    },
    [pending]
  );

  useEffect(() => {
    if (pending) cancelRef.current?.focus();
  }, [pending]);

  useEffect(() => {
    if (!pending) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pending, finish]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {pending && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby={pending.description ? "confirm-description" : undefined}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => finish(false)} />
          <div className="relative bg-blanco rounded-card shadow-xl w-full max-w-sm p-6 motion-safe:animate-[dialog-in_160ms_ease-out]">
            <h2 id="confirm-title" className="font-sora text-lg font-semibold text-grafito">
              {pending.title}
            </h2>
            {pending.description && (
              <p id="confirm-description" className="mt-2 text-sm text-gris-600">
                {pending.description}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => finish(false)}
                className="btn-outline"
              >
                {pending.cancelLabel ?? "Cancelar"}
              </button>
              <button
                type="button"
                onClick={() => finish(true)}
                className={
                  pending.variant === "danger"
                    ? "bg-error text-blanco font-medium px-6 py-3 rounded-btn hover:bg-error/90 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2"
                    : "btn-primary"
                }
              >
                {pending.confirmLabel ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm debe usarse dentro de ConfirmProvider");
  }
  return context;
}
