import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

/**
 * Example MCP Tool: Hello World
 *
 * This is a simple example tool that demonstrates the basic structure
 * of an MCP tool using Claude Agent SDK.
 *
 * Use this as a template to create your own custom tools.
 */
export const helloWorldTool = tool(
  "hello-world",
  "A simple greeting tool that says hello to a given name",
  {
    name: z.string().describe("The name to greet"),
    language: z.enum(["en", "ko", "es", "fr"]).optional().default("en").describe("Language for greeting (default: en)"),
  },
  async ({ name, language = "en" }) => {
    const greetings: Record<string, string> = {
      en: `Hello, ${name}! 👋`,
      ko: `안녕하세요, ${name}님! 👋`,
      es: `¡Hola, ${name}! 👋`,
      fr: `Bonjour, ${name}! 👋`,
    };

    const greeting = greetings[language] || greetings.en;

    return {
      content: [{
        type: "text" as const,
        text: greeting,
      }],
    };
  }
);
