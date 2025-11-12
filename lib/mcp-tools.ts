import { createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { helloWorldTool } from "./mcp-tools/hello-world";

/**
 * Custom MCP Server
 *
 * This MCP server includes your custom tools that extend the agent's capabilities.
 * Add your own tools to the tools array below.
 *
 * Example tools you can create:
 * - Database queries
 * - API integrations
 * - File processing
 * - Custom calculations
 * - External service connections
 */
export const customMcpServer = createSdkMcpServer({
  name: "custom-tools",
  version: "1.0.0",
  tools: [
    helloWorldTool,
    // Add your custom tools here
  ],
});