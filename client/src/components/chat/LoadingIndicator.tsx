export function LoadingIndicator() {
  return (
    <div className="flex w-full mb-4 justify-start">
      <div className="max-w-[80%] rounded-lg px-4 py-3">
        <div className="flex gap-1">
          <span
            className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
