import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUpload from '@/components/ui/file-upload';
import { Loader2 } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'file' | 'date' | 'datetime-local' | 'checkbox' | 'color';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string; // for file uploads
  maxSize?: number; // for file uploads in MB
  min?: number; // for number inputs
  max?: number; // for number inputs
  step?: number; // for number inputs
  rows?: number; // for textarea
  className?: string;
}

interface AdminFormProps {
  title: string;
  fields: FormField[];
  data: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  showCancel?: boolean;
  className?: string;
}

export const AdminForm: React.FC<AdminFormProps> = ({
  title,
  fields,
  data,
  onChange,
  onSubmit,
  loading = false,
  submitText = 'Save',
  cancelText = 'Cancel',
  onCancel,
  showCancel = false,
  className = ''
}) => {
  const renderField = (field: FormField) => {
    const baseProps = {
      id: field.name,
      name: field.name,
      required: field.required,
      className: field.className || ''
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'date':
      case 'datetime-local':
      case 'color':
        return (
          <Input
            {...baseProps}
            type={field.type}
            value={data[field.name] || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'number':
        return (
          <Input
            {...baseProps}
            type="number"
            value={data[field.name] || ''}
            onChange={(e) => onChange(field.name, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step || 'any'}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...baseProps}
            value={data[field.name] || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
          />
        );

      case 'select':
        return (
          <Select
            value={data[field.name] || ''}
            onValueChange={(value) => onChange(field.name, value)}
            required={field.required}
          >
            <SelectTrigger className={field.className}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'file':
        return (
          <FileUpload
            label=""
            accept={field.accept || 'image/*'}
            maxSize={field.maxSize || 5}
            onFileSelect={(file) => onChange(field.name, file)}
            currentImageUrl={data[field.name] && typeof data[field.name] === 'string' ? data[field.name] : undefined}
            placeholder={field.placeholder}
            required={field.required}
            className={field.className}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              {...baseProps}
              type="checkbox"
              checked={data[field.name] || false}
              onChange={(e) => onChange(field.name, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              {field.type !== 'checkbox' && (
                <Label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              )}
              {renderField(field)}
            </div>
          ))}

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                submitText
              )}
            </Button>

            {showCancel && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminForm;
