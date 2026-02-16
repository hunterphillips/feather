import { StreamTextResult, JSONValue } from 'ai';

// Workflow result wraps a stream with optional annotations
export interface WorkflowResult {
  result: StreamTextResult<any, any>;
  annotations?: JSONValue[];
}

// Workflow handler function signature
// Note: messages are pre-converted to multimodal format by the router
export type WorkflowHandler = (params: {
  messages: any[];  // Already converted via convertMessagesForAI()
  toolConfig: Record<string, unknown>;
  systemContext?: string;
  provider: string;
  model: string;
}) => Promise<WorkflowResult>;

// Workflow registry
const workflowRegistry = new Map<string, WorkflowHandler>();

// Register a workflow handler
export function registerWorkflow(id: string, handler: WorkflowHandler): void {
  workflowRegistry.set(id, handler);
}

// Get workflow handler by ID
export function getWorkflowHandler(workflowId?: string): WorkflowHandler | null {
  if (!workflowId) return null;
  return workflowRegistry.get(workflowId) || null;
}
