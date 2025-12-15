import { useState } from 'react';
import { useConfigStore } from '@/store/config-store';
import type { Attachment } from '@/lib/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useFileUpload(chatId: string | null) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addAttachment = useConfigStore((state) => state.addAttachment);

  const uploadFile = async (file: File): Promise<Attachment | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      // IMPORTANT: Append chatId BEFORE file so it's available in multer's destination callback
      if (chatId) {
        formData.append('chatId', chatId);
      }
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/uploads`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const attachment: Attachment = await response.json();
      addAttachment(attachment);
      return attachment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFiles = async (files: FileList): Promise<Attachment[]> => {
    const uploads = Array.from(files).map((file) => uploadFile(file));
    const results = await Promise.all(uploads);
    return results.filter(
      (attachment): attachment is Attachment => attachment !== null
    );
  };

  return {
    uploadFile,
    uploadFiles,
    isUploading,
    error,
  };
}
