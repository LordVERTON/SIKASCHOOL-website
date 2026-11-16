"use client";
import { useId } from 'react';
import Dialog from '@/components/Common/Dialog';
import Button from '@/components/Common/Button';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}: AlertModalProps) {
  const titleId = useId();
  const messageId = useId();

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20'
        };
      case 'error':
        return {
          icon: '❌',
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20'
        };
      case 'warning':
        return {
          icon: '⚠️',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        };
      default:
        return {
          icon: 'ℹ️',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  return (
    <Dialog isOpen={isOpen} onClose={onClose} labelledBy={titleId} describedBy={messageId} className="sika-dialog-compact">
      <div className={`${bgColor} rounded-lg p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl" aria-hidden="true">{icon}</span>
          <h2 id={titleId} className={`text-lg font-semibold ${color}`}>{title}</h2>
        </div>
        <p id={messageId} className="text-sm text-waterloo dark:text-manatee mb-6">{message}</p>
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Fermer
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
