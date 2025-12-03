import React, { useEffect } from 'react';
import { Select } from '@/components/ui/select';
import { useConfigStore } from '@/store/config-store';

export function ModelSelector() {
  const {
    currentProvider,
    currentModel,
    availableModels,
    setProvider,
    setModel,
    fetchModels,
  } = useConfigStore();

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const providerOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google' },
  ];

  const modelOptions =
    availableModels?.[currentProvider as keyof typeof availableModels]?.map(
      (m) => ({
        value: m,
        label: m,
      })
    ) || [];

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value;
    setProvider(newProvider);

    // Auto-select first model of new provider
    const newModels =
      availableModels?.[newProvider as keyof typeof availableModels];
    if (newModels && newModels.length > 0) {
      setModel(newModels[0]);
    }
  };

  return (
    <div className="flex gap-2 p-4 bg-background">
      <Select
        value={currentProvider}
        onChange={handleProviderChange}
        options={providerOptions}
        className="w-40"
      />
      <Select
        value={currentModel}
        onChange={(e) => setModel(e.target.value)}
        options={modelOptions}
        disabled={modelOptions.length === 0}
      />
    </div>
  );
}
