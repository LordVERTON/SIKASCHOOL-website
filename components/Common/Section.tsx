import type { HTMLAttributes } from 'react';

export function Container({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`sika-container ${className}`} />;
}

export default function Section({
  className = '',
  ...props
}: HTMLAttributes<HTMLElement>) {
  return <section {...props} className={`sika-section ${className}`} />;
}
