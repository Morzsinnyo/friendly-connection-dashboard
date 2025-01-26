import { CustomRecurrence } from "@/api/types/contacts";
import { format, addDays, addWeeks, addMonths, addYears } from "date-fns";

interface RecurrencePreviewProps {
  recurrence: CustomRecurrence;
}

export const RecurrencePreview: React.FC<RecurrencePreviewProps> = ({ recurrence }) => {
  const getNextOccurrences = (count: number = 3): Date[] => {
    const dates: Date[] = [];
    let currentDate = new Date();

    for (let i = 0; i < count; i++) {
      switch (recurrence.unit) {
        case 'day':
          currentDate = addDays(currentDate, recurrence.interval);
          break;
        case 'week':
          currentDate = addWeeks(currentDate, recurrence.interval);
          break;
        case 'month':
          currentDate = addMonths(currentDate, recurrence.interval);
          break;
        case 'year':
          currentDate = addYears(currentDate, recurrence.interval);
          break;
      }
      dates.push(new Date(currentDate));
    }

    return dates;
  };

  const getEndDescription = () => {
    switch (recurrence.ends) {
      case 'never':
        return 'No end date';
      case 'on':
        return recurrence.endDate ? `Until ${format(new Date(recurrence.endDate), 'PPP')}` : '';
      case 'after':
        return recurrence.occurrences ? `For ${recurrence.occurrences} occurrences` : '';
      default:
        return '';
    }
  };

  const nextDates = getNextOccurrences();

  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      <p>
        Repeats every {recurrence.interval} {recurrence.unit}
        {recurrence.interval > 1 ? 's' : ''}.{' '}
        {getEndDescription()}
      </p>
      <div>
        <p>Next occurrences:</p>
        <ul className="list-disc list-inside">
          {nextDates.map((date, index) => (
            <li key={index}>{format(date, 'PPP')}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};