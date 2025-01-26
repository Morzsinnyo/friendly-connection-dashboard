import React from 'react';
import { CustomRecurrence } from '@/api/types/contacts';

interface RecurrencePreviewProps {
  recurrence: CustomRecurrence;
}

export const RecurrencePreview: React.FC<RecurrencePreviewProps> = ({ recurrence }) => {
  const getPreviewText = () => {
    const { interval, unit, ends, endDate, occurrences } = recurrence;
    
    let text = `Repeats every ${interval} ${unit}${interval > 1 ? 's' : ''}`;
    
    if (ends === 'on' && endDate) {
      text += `, until ${new Date(endDate).toLocaleDateString()}`;
    } else if (ends === 'after' && occurrences) {
      text += `, ${occurrences} time${occurrences > 1 ? 's' : ''}`;
    }
    
    return text;
  };

  return (
    <div className="text-sm text-muted-foreground">
      {getPreviewText()}
    </div>
  );
};