# Claude Agent Template

[![English](https://img.shields.io/badge/lang-English-blue.svg)](./README.md)
[![한국어](https://img.shields.io/badge/lang-한국어-red.svg)](./README.ko.md)

A Next.js template for building AI agents with [Vercel AI SDK](https://sdk.vercel.ai/docs), [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/overview), and custom MCP tools.

## Overview

This template provides a complete foundation for building AI agents powered by Claude Haiku 4.5. It demonstrates how to create custom tools, integrate with external services, and build interactive chat interfaces with real-time streaming.

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
- **One of the following for authentication:**
  - Anthropic API Key ([Get one here](https://console.anthropic.com/)), OR
  - Claude Code CLI ([Install guide](https://docs.claude.com/claude-code))

### Setup

1. **Clone and install dependencies**

   ```bash
   git clone <your-repo-url>
   cd claude-agent-template
   pnpm install
   ```

2. **Authentication Setup (choose one)**

   **Option A: Using API Key (Recommended for production)**

   Copy `.env.example` to `.env` and add your API key:
   ```bash
   cp .env.example .env
   # Edit .env and add: ANTHROPIC_API_KEY=your_api_key_here
   ```

   **Option B: Using Claude Code CLI**

   If you have Claude Code CLI installed and authenticated:
   ```bash
   claude auth login
   # No .env file needed - SDK will use CLI authentication
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

- **Model**: Claude Haiku 4.5 (`claude-haiku-4-5`)
- **Built-in Tools**: Read, Write, Bash, Grep, Glob, WebSearch
- **Custom Tools**: Defined via MCP (Model Context Protocol)
- **Max Turns**: 10 per conversation
- **Streaming**: Yes (Server-Sent Events)

## Development Workflow

This template is designed to work seamlessly with **Claude Code**, leveraging custom slash commands and specialized sub-agents to streamline your development process.

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

### GitHub Issue Management with Sub-Agents

This template includes a **custom slash command** (`/solve-github-issue`) that demonstrates Claude Code's powerful sub-agent architecture:

**Sub-Agents:**
1. **github-issue-planner** - Analyzes GitHub issues and creates comprehensive implementation plans
2. **github-issue-manager** - Manages issue lifecycle (updates, test results, closing)

**Usage with Claude Code:**
```bash
/solve-github-issue 42              # Analyze and plan implementation for issue #42
```

**Automated Workflow:**
1. **Planner sub-agent** analyzes the issue and related context
2. Creates a detailed implementation plan with file locations and steps
3. You review and implement the solution
4. **Manager sub-agent** automatically updates the issue with test results and closes it

This workflow showcases how to build intelligent development automation using Claude Code's custom slash commands and specialized sub-agents.

See `.claude/commands/solve-github-issue.md` and `.claude/agents/` for implementation details.

## Documentation

- **[TOOLS.md](./TOOLS.md)** - Complete guide to creating custom MCP tools
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[CLAUDE.md](./CLAUDE.md)** - Development environment setup and workflow (includes project structure)

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
