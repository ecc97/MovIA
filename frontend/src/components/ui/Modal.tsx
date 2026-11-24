"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalVariant = "center" | "sheet" | "drawer";
type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

const sizes: Record<ModalSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  full: "sm:h-[92vh] sm:max-w-[96vw]",
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  ariaLabel?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  variant?: ModalVariant;
  hideClose?: boolean;
  className?: string;
  bodyClassName?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  ariaLabel,
  children,
  footer,
  size = "md",
  variant = "center",
  hideClose = false,
  className,
  bodyClassName,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const lastFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables?.[0];
    if (first) first.focus();
    else panel?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !focusables || focusables.length === 0) return;

      const firstItem = focusables[0];
      const lastItem = focusables[focusables.length - 1];
      if (!firstItem || !lastItem) return;

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      lastFocused?.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const position =
    variant === "sheet"
      ? "items-end justify-center sm:items-center sm:p-4"
      : variant === "drawer"
        ? "items-stretch justify-end"
        : "items-center justify-center p-4";

  const panelShape =
    variant === "sheet"
      ? "max-h-[92vh] rounded-t-2xl sm:rounded-card motion-safe:animate-[sheet-in_200ms_ease-out]"
      : variant === "drawer"
        ? "h-full max-h-none w-full max-w-sm rounded-none motion-safe:animate-[drawer-in_200ms_ease-out]"
        : "max-h-[92vh] rounded-card motion-safe:animate-[dialog-in_160ms_ease-out]";

  return createPortal(
    <div className={cn("fixed inset-0 z-[70] flex", position)}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm motion-safe:animate-[fade-in_150ms_ease-out]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex w-full flex-col overflow-hidden border border-border bg-surface shadow-2xl focus:outline-none",
          sizes[size],
          panelShape,
          className
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="font-sora text-lg font-semibold text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-muted">
                  {description}
                </p>
              )}
            </div>
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex size-11 shrink-0 items-center justify-center rounded-btn text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado"
              >
                <X size={20} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {children && <div className={cn("flex-1 overflow-y-auto px-5 py-5", bodyClassName)}>{children}</div>}

        {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
