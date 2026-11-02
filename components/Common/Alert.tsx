import type { HTMLAttributes } from 'react';

export default function Alert({
  tone = 'error',
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: 'error' | 'success' | 'info' }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      {...props}
      className={`sika-alert sika-alert-${tone} ${className}`}
    />
  );
}
