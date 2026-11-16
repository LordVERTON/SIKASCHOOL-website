"use client";
import { useId } from 'react';
import Dialog from '@/components/Common/Dialog';
import Button from '@/components/Common/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'warning'
}: ConfirmationModalProps) {
  const titleId = useId();
  const messageId = useId();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        return 'bg-primary hover:bg-primary/90 text-white';
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} labelledBy={titleId} describedBy={messageId} className="sika-dialog-compact">
      <div className="bg-white dark:bg-blacksection rounded-lg p-6">
        <h2 id={titleId} className="text-lg font-semibold text-black dark:text-white mb-4">{title}</h2>
        <p id={messageId} className="text-sm text-waterloo dark:text-manatee mb-6">{message}</p>
        <div className="flex flex-wrap gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-md ${getButtonStyles()}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
