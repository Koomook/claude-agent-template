import { useState } from "react";
import { toast } from "sonner";
import { UIMessage } from "@/lib/types/agent";
import { AgentMessage } from "@/lib/types/agent";

export function useAgent() {
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
          sessionId: sessionId,
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
      let currentText = "";
      const toolMessageMap = new Map<string, UIMessage>();

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

              console.log("📨 Message received:", data);

              if (data.type === "debug") {
                const content = data.content as Record<string, unknown>;
                console.log("🔍 Agent Debug:", content);
                setProcessingStatus("Agent initialized");
              } else if (data.type === "stream_event") {
                const content = data.content as Record<string, unknown>;
                const event = content.event as Record<string, unknown>;

                if (event.type === "content_block_start") {
                  currentText = "";
                  setProcessingStatus("Generating response...");

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
                    currentText += delta.text;

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
                  currentAssistantMessage = null;
                  currentText = "";
                }
              } else if (data.type === "assistant") {
                const content = data.content as Record<string, unknown>;
                console.log("💬 Assistant message:", content);

                const sdkMessage = content.message as Record<string, unknown>;
                if (sdkMessage && Array.isArray(sdkMessage.content)) {
                  const toolUseBlocks = sdkMessage.content.filter(
                    (block: Record<string, unknown>) => block.type === "tool_use"
                  );

                  for (const toolBlock of toolUseBlocks) {
                    const toolName = String(toolBlock.name || "unknown");
                    const toolInput = toolBlock.input as Record<string, unknown> || {};
                    const toolUseId = String(toolBlock.id || "");

                    setProcessingStatus(`Using tool: ${toolName}`);

                    const toolMessage: UIMessage = {
                      id: `tool-${toolUseId || Date.now()}-${Math.random()}`,
                      role: "assistant",
                      parts: [{
                        type: "tool" as const,
                        toolName: toolName,
                        toolInput: toolInput,
                        toolUseId: toolUseId,
                      }] as UIMessage["parts"],
                    };
                    toolMessageMap.set(toolUseId, toolMessage);
                    setMessages((prev) => [...prev, toolMessage]);
                  }
                }
              } else if (data.type === "user") {
                const content = data.content as Record<string, unknown>;
                const userMessage = content.message as Record<string, unknown>;

                if (userMessage && Array.isArray(userMessage.content)) {
                  const toolResultBlocks = userMessage.content.filter(
                    (block: Record<string, unknown>) => block.type === "tool_result"
                  );

                  for (const resultBlock of toolResultBlocks) {
                    const toolUseId = String(resultBlock.tool_use_id || "");
                    const toolResult = resultBlock.content;

                    const toolMessage = toolMessageMap.get(toolUseId);
                    if (toolMessage && toolMessage.parts[0]) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (toolMessage.parts[0] as any).toolResult = toolResult;
                      setMessages((prev) => [...prev]);
                    }
                  }
                }
              } else if (data.type === "system") {
                const content = data.content as Record<string, unknown>;
                console.log("⚙️ System message:", content);

                if (content.subtype === "init") {
                  const newSessionId = content.session_id as string;
                  if (newSessionId && !sessionId) {
                    setSessionId(newSessionId);
                    console.log(`📝 Session ID captured (new): ${newSessionId}`);
                    setProcessingStatus("System initialized");
                  } else if (newSessionId && sessionId) {
                    console.log(`📝 Session ID (resumed): ${newSessionId}`);
                  }
                }
              } else if (data.type === "result") {
                const content = data.content as Record<string, unknown>;
                console.log("✅ Final result:", content);

                setProcessingStatus("Complete");

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

  return {
    input,
    setInput,
    messages,
    isGenerating,
    processingStatus,
    sendMessage,
    stop,
  };
}
