import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Eye, FileImage } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File | null) => void;
  currentImageUrl?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = "Choose File",
  accept = "image/*",
  maxSize = 5, // 5MB default
  onFileSelect,
  currentImageUrl,
  placeholder = "No file selected",
  required = false,
  className = ""
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      onFileSelect(null);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type if accept is specified
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      toast.error('Invalid file type');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, [maxSize, accept, onFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onFileSelect(null);
    
    // Clear the input value
    const input = document.getElementById('file-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  const currentImage = previewUrl || currentImageUrl;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="file-input" className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      {/* Drag and Drop Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${currentImage ? 'border-green-500' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {currentImage ? (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative inline-block">
              <img
                src={currentImage}
                alt="Preview"
                className="max-w-full max-h-48 rounded-lg shadow-md"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(currentImage, '_blank')}
                  className="bg-white/90 hover:bg-white"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={clearFile}
                  className="bg-red-500/90 hover:bg-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* File Info */}
            <div className="text-sm text-gray-600">
              {selectedFile ? (
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : currentImageUrl ? (
                <p className="font-medium">Current image</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <FileImage className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop your file here, or{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-500 underline"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {accept === 'image/*' ? 'Images only' : 'Any file type'} • Max {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <Input
        id="file-input"
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        required={required}
      />

      {/* Upload Button Alternative */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('file-input')?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Choose File
        </Button>
        
        {(selectedFile || currentImageUrl) && (
          <Button
            type="button"
            variant="outline"
            onClick={clearFile}
            className="flex items-center gap-2 text-red-600 hover:text-red-500"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* File Status */}
      <div className="text-sm text-gray-600">
        {selectedFile ? (
          <p className="text-green-600">✓ File selected: {selectedFile.name}</p>
        ) : currentImageUrl ? (
          <p className="text-blue-600">ℹ Current file uploaded</p>
        ) : (
          <p className="text-gray-500">{placeholder}</p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
