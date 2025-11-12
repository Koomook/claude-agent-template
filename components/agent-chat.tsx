"use client";

import cn from "classnames";
import { toast } from "sonner";
import { useState } from "react";
import { Messages } from "./messages";
import { Footnote } from "./footnote";
import { ArrowUpIcon, StopIcon } from "./icons";
import { Input } from "./input";
import { UIMessage } from "ai";

interface AgentMessage {
  type: string;
  content: unknown;
  timestamp: string;
}

export function AgentChat() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Array<UIMessage>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const sendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;

    if (promptToSend === "" || isGenerating) {
      return;
    }

    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: "user",
      parts: [{ type: "text", text: promptToSend }],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);
    setProcessingStatus("Initializing agent...");

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          prompt: promptToSend,
          sessionId: sessionId, // Pass session ID to resume conversation
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let currentAssistantMessage: UIMessage | null = null;
      let buffer = "";
      let currentText = ""; // Track accumulated text for streaming
      const toolMessageMap = new Map<string, UIMessage>(); // Track tool messages by tool_use_id

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data: AgentMessage = JSON.parse(line.slice(6));

              // Log all messages for debugging
              console.log("📨 Message received:", data);

              // Handle different message types
              if (data.type === "debug") {
                // Show debug info
                const content = data.content as Record<string, unknown>;
                console.log("🔍 Agent Debug:", content);
                setProcessingStatus("Agent initialized");
              } else if (data.type === "stream_event") {
                // Handle token-by-token streaming events
                const content = data.content as Record<string, unknown>;
                const event = content.event as Record<string, unknown>;

                if (event.type === "content_block_start") {
                  // Start new content block
                  currentText = "";
                  setProcessingStatus("Generating response...");

                  // Create new assistant message if not exists
                  if (!currentAssistantMessage) {
                    currentAssistantMessage = {
                      id: `assistant-${Date.now()}`,
                      role: "assistant",
                      parts: [{ type: "text", text: "" }],
                    };
                    setMessages((prev) => [...prev, currentAssistantMessage!]);
                  }
                } else if (event.type === "content_block_delta") {
                  const delta = event.delta as Record<string, unknown>;
                  if (delta.type === "text_delta" && typeof delta.text === "string") {
                    // Append new token to current text
                    currentText += delta.text;

                    // Update the current assistant message
                    if (currentAssistantMessage) {
                      currentAssistantMessage.parts = [
                        { type: "text", text: currentText },
                      ];
                      setMessages((prev) =>
                        prev.map(m => m.id === currentAssistantMessage!.id ? { ...currentAssistantMessage! } : m)
                      );
                    }
                  }
                } else if (event.type === "content_block_stop") {
                  // Content block complete, prepare for next message
                  currentAssistantMessage = null;
                  currentText = "";
                }
              } else if (data.type === "assistant") {
                // Handle Claude Agent SDK assistant message
                const content = data.content as Record<string, unknown>;
                console.log("💬 Assistant message:", content);

                // Extract message content from SDK format
                const sdkMessage = content.message as Record<string, unknown>;
                if (sdkMessage && Array.isArray(sdkMessage.content)) {
                  // Check for tool use
                  const toolUseBlocks = sdkMessage.content.filter(
                    (block: Record<string, unknown>) => block.type === "tool_use"
                  );

                  // Show tool usage
                  for (const toolBlock of toolUseBlocks) {
                    const toolName = String(toolBlock.name || "unknown");
                    const toolInput = toolBlock.input as Record<string, unknown> || {};
                    const toolUseId = String(toolBlock.id || "");

                    setProcessingStatus(`Using tool: ${toolName}`);

                    // Create a tool use message
                    const toolMessage: UIMessage = {
                      id: `tool-${toolUseId || Date.now()}-${Math.random()}`,
                      role: "assistant",
                      parts: [{
                        type: "tool" as const,
                        toolName: toolName,
                        toolInput: toolInput,
                        toolUseId: toolUseId,
                      } as any],
                    };
                    toolMessageMap.set(toolUseId, toolMessage);
                    setMessages((prev) => [...prev, toolMessage]);
                  }

                  // Skip showing text content here since it's already been streamed
                  // via stream_event messages (content_block_delta)
                }
              } else if (data.type === "user") {
                // Handle user messages (tool results)
                const content = data.content as Record<string, unknown>;
                const userMessage = content.message as Record<string, unknown>;

                if (userMessage && Array.isArray(userMessage.content)) {
                  // Check for tool results
                  const toolResultBlocks = userMessage.content.filter(
                    (block: Record<string, unknown>) => block.type === "tool_result"
                  );

                  // Update tool messages with results
                  for (const resultBlock of toolResultBlocks) {
                    const toolUseId = String(resultBlock.tool_use_id || "");
                    const toolResult = resultBlock.content;

                    // Find the corresponding tool message and update it
                    const toolMessage = toolMessageMap.get(toolUseId);
                    if (toolMessage && toolMessage.parts[0]) {
                      (toolMessage.parts[0] as any).toolResult = toolResult;

                      // Trigger re-render by updating messages
                      setMessages((prev) => [...prev]);
                    }
                  }
                }
              } else if (data.type === "system") {
                // Handle system messages (tool use, etc)
                const content = data.content as Record<string, unknown>;
                console.log("⚙️ System message:", content);

                if (content.subtype === "init") {
                  // Capture session ID from system init message
                  const newSessionId = content.session_id as string;
                  if (newSessionId && !sessionId) {
                    // Only capture and show status for NEW sessions
                    setSessionId(newSessionId);
                    console.log(`📝 Session ID captured (new): ${newSessionId}`);
                    setProcessingStatus("System initialized");
                  } else if (newSessionId && sessionId) {
                    // Session already exists, just log (don't show status)
                    console.log(`📝 Session ID (resumed): ${newSessionId}`);
                  }
                }
              } else if (data.type === "result") {
                // Handle final result
                const content = data.content as Record<string, unknown>;
                console.log("✅ Final result:", content);

                setProcessingStatus("Complete");

                // Show final stats
                const statsMessage: UIMessage = {
                  id: `stats-${Date.now()}`,
                  role: "assistant",
                  parts: [{
                    type: "text" as const,
                    text: `✅ **Completed**\n` +
                          `Turns: ${content.num_turns || "N/A"}\n` +
                          `Duration: ${content.duration_ms ? `${Math.round(Number(content.duration_ms) / 1000)}s` : "N/A"}`,
                  }],
                };
                setMessages((prev) => [...prev, statsMessage]);
              }
            } catch (e) {
              console.error("Failed to parse message:", e);
            }
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.info("Generation stopped");
      } else {
        console.error("Error:", error);
        toast.error("An error occurred, please try again!");
      }
    } finally {
      setIsGenerating(false);
      setProcessingStatus("");
      setAbortController(null);
    }
  };

  const stop = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  return (
    <div
      className={cn(
        "px-4 md:px-0 pb-4 pt-8 flex flex-col h-dvh items-center w-full max-w-3xl",
        {
          "justify-between": messages.length > 0,
          "justify-center gap-4": messages.length === 0,
        },
      )}
    >
      {messages.length > 0 ? (
        <Messages messages={messages} status={isGenerating ? "streaming" : "ready"} />
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-0.5 sm:text-2xl text-xl w-full">
            <div className="flex flex-row gap-2 items-center">
              <div>Claude Agent Template</div>
            </div>
            <div className="dark:text-zinc-500 text-zinc-400">
              AI Agent powered by Claude Agent SDK with custom MCP tools
            </div>
            <div className="dark:text-zinc-600 text-zinc-500 text-sm mt-2">
              Multi-turn agentic workflows · Custom tool integration · Real-time streaming
            </div>
          </div>

          {/* Example prompts */}
          <div className="flex flex-col gap-3 w-full">
            <div className="text-sm dark:text-zinc-400 text-zinc-600 font-medium">
              Try these examples
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => sendMessage("Say hello to Alice in Korean")}
                className="text-left p-4 rounded-lg border dark:border-zinc-700 border-zinc-200 dark:bg-zinc-800/50 bg-zinc-50 hover:dark:bg-zinc-800 hover:bg-zinc-100 transition-colors"
              >
                <div className="text-sm font-medium dark:text-zinc-200 text-zinc-800">
                  Hello World Tool
                </div>
                <div className="text-xs dark:text-zinc-500 text-zinc-600 mt-1">
                  Test the example MCP tool with multilingual greetings
                </div>
              </button>

              <button
                onClick={() => sendMessage("Read the README.md file and summarize what this template does")}
                className="text-left p-4 rounded-lg border dark:border-zinc-700 border-zinc-200 dark:bg-zinc-800/50 bg-zinc-50 hover:dark:bg-zinc-800 hover:bg-zinc-100 transition-colors"
              >
                <div className="text-sm font-medium dark:text-zinc-200 text-zinc-800">
                  File Operations
                </div>
                <div className="text-xs dark:text-zinc-500 text-zinc-600 mt-1">
                  Use built-in Read tool to access files
                </div>
              </button>

              <button
                onClick={() => sendMessage("Search for 'tool' in the codebase and show me where custom tools are defined")}
                className="text-left p-4 rounded-lg border dark:border-zinc-700 border-zinc-200 dark:bg-zinc-800/50 bg-zinc-50 hover:dark:bg-zinc-800 hover:bg-zinc-100 transition-colors"
              >
                <div className="text-sm font-medium dark:text-zinc-200 text-zinc-800">
                  Code Search
                </div>
                <div className="text-xs dark:text-zinc-500 text-zinc-600 mt-1">
                  Use Grep tool to search through code
                </div>
              </button>

              <button
                onClick={() => sendMessage("What custom tools are available?")}
                className="text-left p-4 rounded-lg border dark:border-zinc-700 border-zinc-200 dark:bg-zinc-800/50 bg-zinc-50 hover:dark:bg-zinc-800 hover:bg-zinc-100 transition-colors"
              >
                <div className="text-sm font-medium dark:text-zinc-200 text-zinc-800">
                  Agent Capabilities
                </div>
                <div className="text-xs dark:text-zinc-500 text-zinc-600 mt-1">
                  Learn about available tools and features
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full">
        <div className="flex relative flex-col gap-1 p-3 w-full rounded-2xl dark:bg-zinc-800 bg-zinc-100">
          <Input
            input={input}
            setInput={setInput}
            selectedModelId="sonnet-3.7"
            isGeneratingResponse={isGenerating}
            isReasoningEnabled={false}
            onSubmit={sendMessage}
          />

          <div className="absolute bottom-2.5 right-2.5 flex flex-row gap-2">
            <button
              className={cn(
                "size-8 flex flex-row justify-center items-center dark:bg-zinc-100 bg-zinc-900 dark:text-zinc-900 text-zinc-100 p-1.5 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-300 hover:scale-105 active:scale-95 transition-all",
                {
                  "dark:bg-zinc-200 dark:text-zinc-500":
                    isGenerating || input === "",
                },
              )}
              onClick={() => {
                if (input === "") {
                  return;
                }

                if (isGenerating) {
                  stop();
                } else {
                  sendMessage();
                }
              }}
            >
              {isGenerating ? <StopIcon /> : <ArrowUpIcon />}
            </button>
          </div>
        </div>

        <Footnote />
      </div>
    </div>
  );
}