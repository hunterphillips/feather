import { useEffect, useState } from 'react';
import { X, File, FileText, FileCode, Image } from 'lucide-react';

interface AttachmentPreviewProps {
  file: File;
  onRemove: () => void;
}

export function AttachmentPreview({ file, onRemove }: AttachmentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  const isCode =
    file.type.includes('javascript') ||
    file.type.includes('typescript') ||
    file.type === 'application/json';
  const isText = file.type.startsWith('text/');

  // Create object URL for image preview
  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isImage]);

  const getIcon = () => {
    if (isImage) return Image;
    if (isPdf) return File;
    if (isCode) return FileCode;
    if (isText) return FileText;
    return File;
  };

  const Icon = getIcon();

  return (
    <div className="relative group inline-flex items-center gap-2 p-2 bg-accent border border-border rounded-lg">
      {isImage && previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name}
          className="w-12 h-12 object-cover rounded"
        />
      ) : (
        <div className="w-12 h-12 flex items-center justify-center bg-background rounded">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <div className="flex flex-col min-w-0">
        <span className="text-xs text-foreground truncate max-w-[150px]">
          {file.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {(file.size / 1024).toFixed(1)} KB
        </span>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
