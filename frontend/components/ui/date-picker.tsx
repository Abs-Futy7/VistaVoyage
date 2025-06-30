"use client"

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  id?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,  
  placeholder = "Select date",
  id
}) => {
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          type="date"
          value={value ? value.toISOString().split('T')[0] : ''}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : undefined)}
          className="pr-10"
        />
        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};
