'use client';

import { useId, type ReactNode } from 'react';

type Props = {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  language?: string;
};

export default function AccordionItem({
  title,
  open,
  onToggle,
  children,
  language,
}: Props) {
  const id = useId();
  return (
    <div className="sika-accordion-item" data-open={open} lang={language}>
      <h3>
        <button
          type="button"
          id={`${id}-trigger`}
          data-accordion-trigger
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
        >
          <span>{title}</span>
          <span className="sika-accordion-icon" aria-hidden="true">
            {open ? '−' : '+'}
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        hidden={!open}
        className="sika-accordion-panel"
      >
        {children}
      </div>
    </div>
  );
}
