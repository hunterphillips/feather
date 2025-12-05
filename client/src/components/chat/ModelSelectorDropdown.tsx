import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { useConfigStore } from '@/store/config-store';

interface ModelConfig {
  provider: string;
  model: string;
}

interface ModelSelectorDropdownProps {
  selectedModels: ModelConfig[];
  onToggleModel: (provider: string, model: string) => void;
  onClose: () => void;
}

export function ModelSelectorDropdown({
  selectedModels,
  onToggleModel,
  onClose,
}: ModelSelectorDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { availableModels } = useConfigStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!availableModels) return null;

  const isModelSelected = (provider: string, model: string) => {
    return selectedModels.some(
      (m) => m.provider === provider && m.model === model
    );
  };

  const providers = [
    { key: 'openai', label: 'OpenAI' },
    { key: 'anthropic', label: 'Anthropic' },
    { key: 'google', label: 'Google' },
  ] as const;

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 top-full mt-2 w-72 bg-secondary border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
    >
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">
          Select Models for Consensus
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Choose 2 or more models (minimum required)
        </p>
      </div>

      {providers.map(({ key, label }) => {
        const models = availableModels[key] || [];
        if (models.length === 0) return null;

        return (
          <div key={key} className="border-b border-border last:border-0">
            <div className="px-3 py-2 bg-accent/50">
              <span className="text-xs font-medium text-foreground">
                {label}
              </span>
            </div>
            <div className="py-1">
              {models.map((model) => {
                const selected = isModelSelected(key, model);
                return (
                  <button
                    key={`${key}-${model}`}
                    type="button"
                    onClick={() => onToggleModel(key, model)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors text-left"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      {selected && (
                        <Check className="h-4 w-4 text-foreground" />
                      )}
                    </div>
                    <span className="text-sm text-foreground">{model}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="p-3 border-t border-border bg-accent/30">
        <p className="text-xs text-muted-foreground">
          {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''}{' '}
          selected
          {selectedModels.length < 2 && (
            <span className="text-red-500 ml-1">(minimum 2 required)</span>
          )}
        </p>
      </div>
    </div>
  );
}
