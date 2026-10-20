'use client';

import {
  useEffect,
  useRef,
  type ReactNode,
  type SyntheticEvent,
  type KeyboardEvent,
} from 'react';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  children: ReactNode;
  className?: string;
  id?: string;
  returnFocusRef?: { current: HTMLElement | null };
  onEscape?: (event: SyntheticEvent<HTMLDialogElement>) => void;
};

/** Native top layer makes every element behind the dialog inert, including other dialogs. */
export default function Dialog({
  isOpen,
  onClose,
  labelledBy,
  describedBy,
  children,
  className = '',
  id,
  returnFocusRef,
  onEscape,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = returnFocusRef?.current ?? document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Allow a closing menu to restore focus before opening the booking dialog.
    const frame = requestAnimationFrame(() => {
      if (!dialog.open) dialog.showModal();
    });
    return () => {
      cancelAnimationFrame(frame);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true });
    };
  }, [isOpen, returnFocusRef]);

  const trapFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;
    const elements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      element =>
        element.tabIndex >= 0 &&
        element.getClientRects().length > 0 &&
        !element.closest('[inert], [hidden]')
    );
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (!first) {
      event.preventDefault();
      event.currentTarget.focus();
    } else if (!elements.some(element => element === document.activeElement)) {
      // A step heading may receive programmatic focus outside the tab order.
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (
      event.shiftKey &&
      (document.activeElement === first ||
        document.activeElement === event.currentTarget)
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!isOpen) return null;
  return (
    <dialog
      ref={dialogRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      tabIndex={-1}
      className={`sika-dialog ${className}`}
      onKeyDown={trapFocus}
      onCancel={event => {
        event.preventDefault();
        onEscape?.(event);
        if (!event.isPropagationStopped()) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
