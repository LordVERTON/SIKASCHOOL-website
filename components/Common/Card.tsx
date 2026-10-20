import type { HTMLAttributes } from 'react';

export default function Card({
  className = '',
  ...props
}: HTMLAttributes<HTMLElement>) {
  return <article {...props} className={`sika-card ${className}`} />;
}
