import { X, File, FileText, FileCode, Image } from 'lucide-react';
import type { Attachment } from '@/lib/types';

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AttachmentPreview({
  attachment,
  onRemove,
}: AttachmentPreviewProps) {
  const isImage = attachment.mimeType.startsWith('image/');
  const isPdf = attachment.mimeType === 'application/pdf';
  const isCode =
    attachment.mimeType.includes('javascript') ||
    attachment.mimeType.includes('typescript') ||
    attachment.mimeType === 'application/json';
  const isText = attachment.mimeType.startsWith('text/');

  const fileUrl = `${API_URL}/api/uploads/${attachment.path}`;

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
      {isImage ? (
        <img
          src={fileUrl}
          alt={attachment.name}
          className="w-12 h-12 object-cover rounded"
        />
      ) : (
        <div className="w-12 h-12 flex items-center justify-center bg-background rounded">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <div className="flex flex-col min-w-0">
        <span className="text-xs text-foreground truncate max-w-[150px]">
          {attachment.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {(attachment.size / 1024).toFixed(1)} KB
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
