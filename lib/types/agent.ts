export interface UIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts: Array<{
    type: string;
    text?: string;
    [key: string]: unknown;
  }>;
}

export interface AgentMessage {
  type: string;
  content: unknown;
  timestamp: string;
}

export interface StreamEvent {
  type: string;
  event: {
    type: string;
    delta?: {
      type: string;
      text?: string;
    };
  };
}

export interface ToolUse {
  id: string;
  type: "tool_use";
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  type: "tool_result";
  tool_use_id: string;
  content: unknown;
}

export interface AssistantMessage {
  message: {
    content: Array<ToolUse | { type: "text"; text: string }>;
  };
}

export interface UserMessage {
  message: {
    content: Array<ToolResult>;
  };
}

export interface SystemMessage {
  subtype?: string;
  session_id?: string;
}

export interface ResultMessage {
  num_turns?: number;
  duration_ms?: number;
}
