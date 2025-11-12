# Troubleshooting

Common issues and solutions when working with Claude Agent Template.

## Tool Issues

### Tool not found

**Symptoms:**
- Agent cannot find or use your custom tool
- Error messages about missing tools

**Solutions:**
- Verify tool is exported from `lib/mcp-tools/your-tool.ts`
- Check it's imported in `lib/mcp-tools.ts`
- Ensure it's added to `allowedTools` with `mcp__0__` prefix in `app/api/agent/route.ts`

**Example:**
```typescript
// lib/mcp-tools/my-tool.ts
export const myTool = tool(...);

// lib/mcp-tools.ts
import { myTool } from "./mcp-tools/my-tool";
export const customMcpServer = createSdkMcpServer({
  tools: [myTool],
});

// app/api/agent/route.ts
allowedTools: ["mcp__0__my-tool"],
```

## Streaming Issues

### Events not received

**Symptoms:**
- No real-time updates in the UI
- Messages appear all at once
- Console errors about EventSource

**Solutions:**
- Verify `Content-Type: text/event-stream` header is set
- Check browser console for errors
- Ensure SSE format is correct: `data: {...}\n\n`
- Check network tab for proper streaming response

**Debugging:**
```typescript
// Check response headers
const response = await fetch('/api/agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
});
console.log(response.headers.get('Content-Type')); // Should be 'text/event-stream'
```

## Type Errors

### Parameter type mismatches

**Symptoms:**
- TypeScript errors in tool definitions
- Runtime errors when tool is called
- Zod validation failures

**Solutions:**
- Match Zod schemas to parameter types exactly
- Return correct structure: `{ content: [...] }` or `{ content: [...], isError: true }`
- Use proper type assertions: `type: "text" as const`

**Example:**
```typescript
// Correct
return {
  content: [{
    type: "text" as const,  // Use 'as const'
    text: "Result",
  }],
};

// Incorrect
return {
  content: [{
    type: "text",  // Missing 'as const'
    text: "Result",
  }],
};
```

## Environment Variables

### API key not loaded

**Symptoms:**
- 401 Unauthorized errors
- "Missing API key" messages
- Agent cannot connect to Claude

**Solutions:**
- Verify `.env` file exists and contains `ANTHROPIC_API_KEY`
- Restart development server after changing `.env`
- Check `.env` is not committed to git (should be in `.gitignore`)
- Ensure no extra spaces around the API key

**Example `.env`:**
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

## Performance Issues

### Slow responses

**Symptoms:**
- Long wait times for agent responses
- Timeout errors
- UI freezing

**Solutions:**
- Optimize tool implementations (reduce database queries, cache results)
- Reduce `maxTurns` if agent is taking too many steps
- Use streaming to show progress incrementally
- Check network latency to Anthropic API

## Database Issues

### Prisma connection errors

**Symptoms:**
- "Cannot connect to database" errors
- Timeout when querying data
- SSL/TLS errors

**Solutions:**
- Verify `DATABASE_URL` in `.env` is correct
- Check database is accessible from your network
- For SSL connections, add `?sslmode=require` to connection string
- Run `npx prisma generate` after schema changes

**Example connection string:**
```
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

## Build Issues

### Next.js build failures

**Symptoms:**
- `pnpm build` fails
- Type errors during build
- Module not found errors

**Solutions:**
- Run `pnpm install` to ensure all dependencies are installed
- Clear `.next` folder: `rm -rf .next`
- Check for TypeScript errors: `pnpm tsc --noEmit`
- Ensure all imports are correct and files exist

## Getting Help

If you're still experiencing issues:

1. Check the [GitHub Issues](https://github.com/anthropics/claude-agent-sdk/issues)
2. Review [Claude Agent SDK Documentation](https://docs.claude.com/en/docs/agent-sdk/overview)
3. Verify your setup matches the [Quick Start](./README.md#quick-start) guide
4. Check for updates: `pnpm update`
