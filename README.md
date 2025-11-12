# Claude Agent Template

A Next.js template for building AI agents with [Vercel AI SDK](https://sdk.vercel.ai/docs), [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/overview), and custom MCP tools.

> English | [한국어](./README.ko.md)

## Overview

This template provides a complete foundation for building AI agents powered by Claude Sonnet 4.5. It demonstrates how to create custom tools, integrate with external services, and build interactive chat interfaces with real-time streaming.

**Based on:**
- [Vercel AI SDK Reasoning Starter](https://github.com/vercel-labs/ai-sdk-reasoning-starter) - Base Next.js + AI SDK setup
- [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/overview) - Multi-turn agent workflows and MCP tools

## Features

- **Multi-turn Agent Workflows** - Built on Claude Agent SDK for complex task execution
- **Custom MCP Tools** - Easy-to-extend tool system with type safety
- **Real-time Streaming** - Server-sent events for responsive user experience
- **Modern Stack** - Next.js 15, React 19, Tailwind CSS, TypeScript
- **Built-in Tools** - File operations, bash commands, web search, and more

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Anthropic API Key ([Get one here](https://console.anthropic.com/))

### Setup

1. **Clone and install dependencies**

   ```bash
   git clone <your-repo-url>
   cd claude-agent-template
   pnpm install
   ```

2. **Set up environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

3. **Run development server**

   ```bash
   pnpm dev
   ```

   Open http://localhost:3000 in your browser.

## Architecture

### System Overview

The agent system is built on three core components:

1. **Agent API** (`app/api/agent/route.ts`) - Handles requests, manages conversation state, and streams responses
2. **MCP Tools** (`lib/mcp-tools/`) - Custom tools that extend agent capabilities
3. **Chat UI** (`components/agent-chat.tsx`) - Interactive interface with real-time streaming

### Message Flow

```
User Input
  ↓
POST /api/agent → query({ prompt, options })
  ↓
Agent executes tools across multiple turns
  ↓
Server-Sent Events stream to client
  ↓
UI displays tool usage and results
```

### Agent Configuration

- **Model**: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- **Built-in Tools**: Read, Write, Bash, Grep, Glob, WebSearch
- **Custom Tools**: Defined via MCP (Model Context Protocol)
- **Max Turns**: 10 per conversation
- **Streaming**: Yes (Server-Sent Events)

## Development Workflow

### Git Worktree Management

The included `wt` script simplifies creating isolated worktrees for feature branches, allowing you to work on multiple features simultaneously without switching contexts:

```bash
./wt feature/new-feature              # Create worktree for new branch
./wt feature/existing-branch          # Create worktree for existing branch
```

The script automatically:
- Creates a new git worktree in `../feature/new-feature`
- Copies `.env` file to the new worktree
- Installs dependencies with `pnpm install`

**Example workflow:**
```bash
# Working on main branch
./wt feature/add-auth               # Create worktree for auth feature
cd ../feature/add-auth              # Switch to new worktree
pnpm dev                            # Start dev server for this branch
```

### GitHub Issue Management

This template includes the `/solve-github-issue` slash command that leverages two specialized sub-agents:

1. **github-issue-planner** - Analyzes GitHub issues and creates comprehensive implementation plans
2. **github-issue-manager** - Manages issue lifecycle (updates, test results, closing)

**Usage with Claude Code:**
```bash
/solve-github-issue 42              # Analyze and plan implementation for issue #42
```

The workflow:
1. Planner agent analyzes the issue and related context
2. Creates a detailed implementation plan
3. You implement the solution
4. Manager agent updates the issue with test results and closes it

See `.claude/agents/` for agent configurations.

## Documentation

- **[TOOLS.md](./TOOLS.md)** - Complete guide to creating custom MCP tools
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[CLAUDE.md](./CLAUDE.md)** - Development environment setup and workflow

## Project Structure

```
claude-agent-template/
├── app/
│   ├── api/agent/route.ts          # Agent API endpoint with streaming
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Main chat interface
│   └── globals.css                 # Global styles
├── components/
│   ├── agent-chat.tsx              # Main chat UI component
│   ├── input.tsx                   # Chat input with auto-resize
│   └── footnote.tsx                # Footer component
├── lib/
│   ├── mcp-tools.ts                # MCP tools registry
│   └── mcp-tools/
│       └── hello-world.ts          # Example MCP tool
├── .claude/
│   ├── commands/                   # Custom slash commands
│   ├── agents/                     # Specialized agents
│   └── prompts.md                  # System prompts library
├── wt                              # Git worktree helper script
├── CLAUDE.md                       # Development guide
├── TOOLS.md                        # Tool creation guide
├── TROUBLESHOOTING.md              # Troubleshooting guide
└── README.md                       # This file
```

## Resources

- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/overview)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Next.js Documentation](https://nextjs.org/docs)

## Contributing

Guidelines for contributions:
- Keep tools focused and simple
- Document parameters clearly
- Handle all error cases
- Write descriptive system prompts
- Test with various inputs

## License

MIT
