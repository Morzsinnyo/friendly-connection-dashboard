import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CustomRecurrence, RecurrenceUnit, RecurrenceEnds } from "@/api/types/contacts";
import { RecurrencePreview } from './RecurrencePreview';

interface RecurrenceFormProps {
  onSubmit: (recurrence: CustomRecurrence) => void;
  onCancel: () => void;
  initialValues?: CustomRecurrence;
}

export const RecurrenceForm: React.FC<RecurrenceFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
}) => {
  const [recurrence, setRecurrence] = useState<CustomRecurrence>(initialValues || {
    interval: 1,
    unit: 'week',
    ends: 'never',
    endDate: null,
    occurrences: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(recurrence);
  };

  const handleUnitChange = (value: RecurrenceUnit) => {
    setRecurrence({ ...recurrence, unit: value });
  };

  const handleEndsChange = (value: RecurrenceEnds) => {
    setRecurrence({ 
      ...recurrence, 
      ends: value,
      // Reset the other end options when changing type
      endDate: value === 'on' ? recurrence.endDate : null,
      occurrences: value === 'after' ? recurrence.occurrences : null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Repeat every</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            value={recurrence.interval}
            onChange={(e) => setRecurrence({ ...recurrence, interval: parseInt(e.target.value) })}
            className="w-20"
          />
          <Select
            value={recurrence.unit}
            onValueChange={handleUnitChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">day(s)</SelectItem>
              <SelectItem value="week">week(s)</SelectItem>
              <SelectItem value="month">month(s)</SelectItem>
              <SelectItem value="year">year(s)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Ends</Label>
        <RadioGroup
          value={recurrence.ends}
          onValueChange={handleEndsChange}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="never" id="never" />
            <Label htmlFor="never">Never</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="on" id="on" />
            <Label htmlFor="on">On</Label>
            <Input
              type="date"
              disabled={recurrence.ends !== 'on'}
              value={recurrence.endDate || ''}
              onChange={(e) => setRecurrence({ ...recurrence, endDate: e.target.value })}
              className="w-40"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="after" id="after" />
            <Label htmlFor="after">After</Label>
            <Input
              type="number"
              min="1"
              disabled={recurrence.ends !== 'after'}
              value={recurrence.occurrences || ''}
              onChange={(e) => setRecurrence({ ...recurrence, occurrences: parseInt(e.target.value) })}
              className="w-20"
            />
            <span>occurrences</span>
          </div>
        </RadioGroup>
      </div>

      <RecurrencePreview recurrence={recurrence} />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};