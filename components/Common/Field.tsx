'use client';

import { useId, type InputHTMLAttributes } from 'react';

export default function Field({
  label,
  hint,
  error,
  id,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy =
    [
      props['aria-describedby'],
      hint && `${fieldId}-hint`,
      error && `${fieldId}-error`,
    ]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <div>
      <label htmlFor={fieldId} className="mb-2 block text-sm font-semibold">
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        {...props}
        id={fieldId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={`sika-field ${className}`}
      />
      {hint && (
        <p id={`${fieldId}-hint`} className="mt-2 text-sm">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${fieldId}-error`}
          className="mt-2 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}
