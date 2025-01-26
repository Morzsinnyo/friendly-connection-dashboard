import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecurrenceForm } from './RecurrenceForm';
import { CustomRecurrence } from '@/api/types/contacts';

interface CustomRecurrenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recurrence: CustomRecurrence) => void;
  initialValues?: CustomRecurrence;
}

export const CustomRecurrenceDialog: React.FC<CustomRecurrenceDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValues,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Custom Recurrence</DialogTitle>
        </DialogHeader>
        <RecurrenceForm 
          onSubmit={onSave}
          onCancel={onClose}
          initialValues={initialValues}
        />
      </DialogContent>
    </Dialog>
  );
};