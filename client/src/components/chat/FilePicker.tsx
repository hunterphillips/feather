import { useRef } from 'react';
import { Paperclip } from 'lucide-react';

interface FilePickerProps {
  onFilesSelected: (files: FileList) => void;
  disabled?: boolean;
}

const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/javascript',
  'application/javascript',
  'text/x-javascript',
  'application/x-javascript',
  'text/typescript',
  'application/x-typescript',
  'application/json',
].join(',');

export function FilePicker({ onFilesSelected, disabled }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="p-2 hover:bg-accent rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Attach files"
      >
        <Paperclip className="h-5 w-5 text-foreground" />
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
}
