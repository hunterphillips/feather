import { File, FileText, FileCode } from 'lucide-react';
import type { Attachment } from '@/lib/types';

interface MessageAttachmentProps {
  attachment: Attachment;
}

export function MessageAttachment({ attachment }: MessageAttachmentProps) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const fileUrl = `${API_URL}/api/uploads/${attachment.path}`;
  const isImage = attachment.mimeType.startsWith('image/');

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('text/')) return FileText;
    if (
      mimeType.includes('javascript') ||
      mimeType.includes('typescript') ||
      mimeType.includes('json')
    )
      return FileCode;
    return File;
  };

  if (isImage) {
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <img
          src={fileUrl}
          alt={attachment.name}
          className="max-w-xs rounded border border-border hover:opacity-90 transition-opacity"
        />
      </a>
    );
  }

  const IconComponent = getFileIcon(attachment.mimeType);
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded border border-border hover:bg-accent/30 transition-colors"
    >
      <IconComponent className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
    </a>
  );
}
