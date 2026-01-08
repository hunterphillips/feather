export function DemoBanner() {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  if (!isDemoMode) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-yellow-800 dark:text-yellow-200">
            ⚡ <strong>Demo Mode</strong> - This is a showcase with simulated
            responses.
          </span>
        </div>
        <a
          href="https://github.com/hunterphillips/feather"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-medium whitespace-nowrap transition-colors"
        >
          Get the Real Version →
        </a>
      </div>
    </div>
  );
}
