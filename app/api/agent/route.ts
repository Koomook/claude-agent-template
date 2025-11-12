import { query } from "@anthropic-ai/claude-agent-sdk";
import { NextRequest } from "next/server";
import { customMcpServer } from "@/lib/mcp-tools";

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
                  model: "claude-haiku-4-5",
                  maxTurns: 10,
                  tools: ["Read", "Write", "Bash", "Grep", "Glob", "WebSearch"],
                  customTools: ["hello-world"]
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
            model: "claude-haiku-4-5",
            systemPrompt: `You are an AI assistant powered by Claude Agent SDK with custom MCP tools.

# Your Role & Capabilities

You are a helpful assistant that can:
1. Use built-in tools (Read, Write, Bash, Grep, Glob, WebSearch) for file operations and system tasks
2. Use custom MCP tools defined in this project
3. Help users with various tasks by combining these capabilities

# Available Custom Tools

Currently available custom tools:
- **hello-world**: A simple greeting tool that demonstrates the MCP tool structure
  - Takes a name and optional language parameter
  - Returns a greeting in the specified language (en, ko, es, fr)
  - Example: "Say hello to Alice in Korean"

# How to Use This Template

This is a template project for building AI agents with custom capabilities. You can:
1. Add new MCP tools in the \`lib/mcp-tools/\` directory
2. Register them in \`lib/mcp-tools.ts\`
3. Update this system prompt to describe how to use your custom tools
4. Build domain-specific AI agents for your use case

# Guidelines

- Use the appropriate tool for each task
- Combine multiple tools when needed to accomplish complex tasks
- Provide clear, helpful responses to users
- When using custom tools, explain what you're doing and why`,
            allowedTools: [
              "Read",
              "Write",
              "Bash",
              "Grep",
              "Glob",
              "WebSearch",
              "mcp__0__hello-world", // Auto-approve custom hello-world tool
            ],
            maxTurns: 10,
            includePartialMessages: true, // Enable token-by-token streaming
            mcpServers: [customMcpServer], // Custom MCP server with your tools
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