import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4 mb-6">
        {isDanger ? (
          <div className="p-3 bg-red-100 rounded-full text-red-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        ) : (
          <div className="p-3 bg-amber-100 rounded-full text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        )}
        <div className="text-sm text-charcoal-600 mt-1 leading-relaxed">
          {message}
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          variant={isDanger ? 'danger' : 'primary'}
          size="md"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
