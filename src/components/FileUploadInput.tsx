import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadInputProps {
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  onChange: (file: File, preview: string) => void;
  preview?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function FileUploadInput({
  label,
  accept = 'image/*',
  maxSize = 10,
  onChange,
  preview,
  placeholder = 'Click or drag files here',
  disabled = false
}: FileUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (file: File) => {
    setError('');

    // Validate file size
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      setError(`File terlalu besar. Maksimal ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
      setError('Jenis file tidak didukung');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      onChange(file, preview);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="file-upload-container">
      <label className="file-upload-label">{label}</label>
      
      {preview ? (
        <div className="file-preview">
          <div className="preview-image-container">
            {accept.includes('image') ? (
              <img src={preview} alt="Preview" className="preview-image" />
            ) : (
              <div className="preview-file-icon">
                <ImageIcon size={48} />
              </div>
            )}
          </div>
          <button
            type="button"
            className="preview-remove-btn"
            onClick={() => onChange(null as any, '')}
            disabled={disabled}
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div
          className={`file-upload-area ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="upload-icon">
            <Upload size={40} />
          </div>
          <div className="upload-text">
            <p className="upload-main">{placeholder}</p>
            <p className="upload-sub">atau drag & drop file di sini</p>
          </div>
          {maxSize && (
            <p className="upload-size">Maksimal ukuran: {maxSize}MB</p>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />

      {error && <div className="file-upload-error">{error}</div>}
    </div>
  );
}

// Add to global CSS or in a CSS file:
const styles = `
.file-upload-container {
  margin-bottom: 20px;
}

.file-upload-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.file-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.file-upload-area:hover {
  border-color: #9ca3af;
  background: #f3f4f6;
}

.file-upload-area.dragging {
  border-color: #3b82f6;
  background: #eff6ff;
}

.file-upload-area.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.upload-icon {
  color: #9ca3af;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

.upload-text p {
  margin: 0;
  font-size: 14px;
}

.upload-main {
  color: #1f2937;
  font-weight: 500;
}

.upload-sub {
  color: #9ca3af;
  font-size: 13px;
}

.upload-size {
  color: #9ca3af;
  font-size: 12px;
  margin-top: 8px;
}

.file-preview {
  position: relative;
  width: 100%;
  max-width: 300px;
}

.preview-image-container {
  width: 100%;
  aspect-ratio: 1;
  background: #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-file-icon {
  color: #d1d5db;
}

.preview-remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.preview-remove-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.preview-remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-upload-error {
  color: #ef4444;
  font-size: 12px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fee2e2;
  border-radius: 4px;
  border-left: 3px solid #ef4444;
}
`;
