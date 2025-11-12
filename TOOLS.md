# Creating Custom Tools

Guide for creating custom MCP tools to extend your agent's capabilities.

## Tool Structure

Tools are defined using the `tool()` function from the Claude Agent SDK:

```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

export const searchDatabase = tool(
  "search-database",              // Unique tool name
  "Search database records",      // Description for the agent
  {
    query: z.string().describe("Search query"),
    limit: z.number().optional().default(10).describe("Max results"),
  },
  async ({ query, limit = 10 }) => {
    // Implementation
    const results = await db.search(query, limit);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(results, null, 2),
      }],
    };
  }
);
```

## Integration Steps

**1. Create tool file** in `lib/mcp-tools/your-tool.ts`

**2. Register in `lib/mcp-tools.ts`:**

```typescript
import { createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { searchDatabase } from "./mcp-tools/search-database";

export const customMcpServer = createSdkMcpServer({
  name: "custom-tools",
  version: "1.0.0",
  tools: [searchDatabase],
});
```

**3. Configure in `app/api/agent/route.ts`:**

```typescript
allowedTools: [
  "Read", "Write", "Bash", "Grep", "Glob", "WebSearch",
  "mcp__0__search-database", // Add with mcp__0__ prefix
],
```

**4. Update system prompt** (optional) to guide tool usage

## Best Practices

### Parameter Validation

Use Zod for type-safe parameter validation:

```typescript
{
  email: z.string().email().describe("User email"),
  age: z.number().min(0).max(120).describe("User age"),
  role: z.enum(["admin", "user", "guest"]).describe("Role"),
  tags: z.array(z.string()).optional().describe("Optional tags"),
}
```

### Error Handling

Always handle errors gracefully:

```typescript
async ({ param }) => {
  try {
    const result = await riskyOperation(param);
    return {
      content: [{ type: "text" as const, text: result }],
    };
  } catch (error) {
    return {
      content: [{
        type: "text" as const,
        text: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
      }],
      isError: true,
    };
  }
}
```

### System Prompts

Good system prompts should:

1. Define the agent's role and purpose
2. List available tools with usage guidelines
3. Provide examples of correct tool usage
4. Set clear constraints and expectations

## Advanced Examples

### External API Integration

```typescript
export const fetchWeather = tool(
  "fetch-weather",
  "Get weather for a city",
  { city: z.string().describe("City name") },
  async ({ city }) => {
    const response = await fetch(`https://api.weather.com/v1/current?city=${city}`);
    const data = await response.json();
    return {
      content: [{
        type: "text" as const,
        text: `${city}: ${data.condition}, ${data.temp}°C`,
      }],
    };
  }
);
```

### Database Queries

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const queryUsers = tool(
  "query-users",
  "Query users from database",
  { filter: z.string().optional() },
  async ({ filter }) => {
    const users = await prisma.user.findMany({
      where: filter ? { name: { contains: filter } } : {},
    });
    return {
      content: [{ type: "text" as const, text: JSON.stringify(users) }],
    };
  }
);
```

## Resources

- [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/overview)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Zod Documentation](https://zod.dev/)
