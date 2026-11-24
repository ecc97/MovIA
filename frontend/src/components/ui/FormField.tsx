"use client";

import { createContext, forwardRef, useContext, type ElementType, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldContextValue {
  id?: string;
  describedBy?: string;
  invalid?: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue>({});

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, hint, error, required = false, className, children }: FormFieldProps) {
  const describedBy = [hint && `${htmlFor}-hint`, error && `${htmlFor}-error`]
    .filter(Boolean)
    .join(" ");

  return (
    <FormFieldContext.Provider value={{ id: htmlFor, describedBy: describedBy || undefined, invalid: !!error }}>
      <div className={cn("space-y-1.5", className)}>
        <label htmlFor={htmlFor} className="label-field">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
        {children}
        {hint && !error && (
          <p id={`${htmlFor}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${htmlFor}-error`} className="error-message" role="alert">
            {error}
          </p>
        )}
      </div>
    </FormFieldContext.Provider>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ElementType;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon: Icon, className, ...props },
  ref
) {
  const field = useContext(FormFieldContext);
  const id = props.id ?? field.id;
  const describedBy = props["aria-describedby"] ?? field.describedBy;
  const invalid = props["aria-invalid"] ?? field.invalid;

  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      )}
      <input
        {...props}
        ref={ref}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={cn("input-field", Icon && "pl-10", invalid && "border-error focus:border-error focus:ring-error/30", className)}
      />
    </div>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref
) {
  const field = useContext(FormFieldContext);
  const id = props.id ?? field.id;
  const describedBy = props["aria-describedby"] ?? field.describedBy;
  const invalid = props["aria-invalid"] ?? field.invalid;

  return (
    <div className="relative">
      <select
        {...props}
        ref={ref}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={cn("input-field appearance-none pr-10", invalid && "border-error focus:border-error focus:ring-error/30", className)}
      >
        {children}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
    </div>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon?: ElementType;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { icon: Icon, className, ...props },
  ref
) {
  const field = useContext(FormFieldContext);
  const id = props.id ?? field.id;
  const describedBy = props["aria-describedby"] ?? field.describedBy;
  const invalid = props["aria-invalid"] ?? field.invalid;

  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={18}
          className="pointer-events-none absolute left-3 top-3 text-muted"
          aria-hidden="true"
        />
      )}
      <textarea
        {...props}
        ref={ref}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={cn("input-field resize-none", Icon && "pl-10", invalid && "border-error focus:border-error focus:ring-error/30", className)}
      />
    </div>
  );
});
