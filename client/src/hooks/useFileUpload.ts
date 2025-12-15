import { useState } from 'react';
import type { Attachment } from '@/lib/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFilesToChat = async (
    files: File[],
    chatId: string
  ): Promise<Attachment[]> => {
    setIsUploading(true);
    setError(null);
    const attachments: Attachment[] = [];

    try {
      // Upload files sequentially
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append('chatId', chatId);
          formData.append('file', file);

          const response = await fetch(`${API_URL}/api/uploads`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to upload ${file.name}`);
          }

          const attachment: Attachment = await response.json();
          attachments.push(attachment);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : `Upload failed for ${file.name}`;
          console.error(errorMessage);
          // Continue with other files (partial success)
        }
      }

      return attachments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return attachments; // Return whatever succeeded
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFilesToChat,
    isUploading,
    error,
  };
}
