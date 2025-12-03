import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Square } from 'lucide-react';

interface InputAreaProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onStop: () => void;
}

export function InputArea({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  onStop,
}: InputAreaProps) {
  return (
    <form onSubmit={handleSubmit} className="p-4 bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 bg-accent/50 rounded-lg p-3">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {isLoading ? (
            <Button
              type="button"
              onClick={onStop}
              variant="outline"
              className="px-3"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
