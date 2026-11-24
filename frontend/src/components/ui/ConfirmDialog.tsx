"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

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

  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        open={pending !== null}
        onClose={() => finish(false)}
        title={pending?.title ?? ""}
        description={pending?.description}
        hideClose
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => finish(false)}>
              {pending?.cancelLabel ?? "Cancelar"}
            </Button>
            <Button
              variant={pending?.variant === "danger" ? "danger" : "primary"}
              onClick={() => finish(true)}
            >
              {pending?.confirmLabel ?? "Confirmar"}
            </Button>
          </>
        }
      />
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
