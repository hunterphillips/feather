import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
interface ConsensusResponse {
  type: 'consensus-response';
  provider: string;
  model: string;
  content: string;
}

function parseConsensusResponses(annotations: unknown[]): ConsensusResponse[] {
  return annotations.filter(
    (value): value is ConsensusResponse =>
      typeof value === 'object' &&
      value !== null &&
      (value as Record<string, unknown>).type === 'consensus-response'
  );
}

function formatModelName(model: string): string {
  return model.split('/').pop() || model;
}

interface ConsensusResponsesProps {
  annotations: unknown[];
}

export function ConsensusResponses({ annotations }: ConsensusResponsesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedModel, setExpandedModel] = useState<number | null>(null);

  const responses = parseConsensusResponses(annotations);

  if (responses.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border/50 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {responses.length} model responses
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          {responses.map((response, index) => (
            <div
              key={index}
              className="rounded-md border border-border/50 bg-secondary/30"
            >
              <button
                onClick={() =>
                  setExpandedModel(expandedModel === index ? null : index)
                }
                className="flex items-center gap-1.5 w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {expandedModel === index ? (
                  <ChevronDown className="h-3 w-3 shrink-0" />
                ) : (
                  <ChevronRight className="h-3 w-3 shrink-0" />
                )}
                {formatModelName(response.model)}
              </button>

              {expandedModel === index && (
                <div className="px-3 pb-3 text-sm prose-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {response.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
