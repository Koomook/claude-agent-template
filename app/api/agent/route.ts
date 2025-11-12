import { query } from "@anthropic-ai/claude-agent-sdk";
import { NextRequest } from "next/server";
import { customMcpServer } from "@/lib/mcp-tools";
import { agentConfig } from "@/lib/config/agent-config";
import { systemPrompt } from "@/lib/config/system-prompt";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { messages, prompt, sessionId } = await request.json();

  // Debug: Log session state
  console.log('🔍 API Request:', {
    hasSessionId: !!sessionId,
    sessionId: sessionId ? `${sessionId.slice(0, 8)}...` : 'none',
    prompt: prompt.slice(0, 50)
  });

  // Create a readable stream for the response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send debug info only for new sessions (not when resuming)
        if (!sessionId) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "debug",
                content: {
                  message: "Claude Agent initialized with custom tools",
                  sdk: "@anthropic-ai/claude-agent-sdk",
                  model: agentConfig.model,
                  maxTurns: agentConfig.maxTurns,
                  tools: agentConfig.allowedTools.filter(t => !t.startsWith("mcp__")),
                  customTools: agentConfig.allowedTools.filter(t => t.startsWith("mcp__"))
                },
                timestamp: new Date().toISOString(),
              })}\n\n`
            )
          );
        }

        // Use Claude Agent SDK with tools enabled
        const result = query({
          prompt: prompt || messages[messages.length - 1]?.text || "",
          options: {
            ...(sessionId ? { resume: sessionId } : {}), // Resume session if sessionId exists
            model: agentConfig.model,
            systemPrompt,
            allowedTools: agentConfig.allowedTools,
            maxTurns: agentConfig.maxTurns,
            includePartialMessages: true, // Enable token-by-token streaming
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mcpServers: [customMcpServer] as any, // Custom MCP server with your tools
          },
        });

        // Stream messages as they arrive
        for await (const message of result) {
          // Format message for client consumption
          const data = {
            type: message.type,
            content: message,
            timestamp: new Date().toISOString(),
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        }

        controller.close();
      } catch (error) {
        console.error("Agent error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Agent execution failed" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}