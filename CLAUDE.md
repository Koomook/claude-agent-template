# CLAUDE.md - Development Guide

> Development guide for the Claude Agent Template

## Development Environment

### Commands

```bash
pnpm install       # Install dependencies
pnpm dev           # Start development server (http://localhost:3000)
pnpm build         # Build for production
pnpm start         # Start production server
pnpm lint          # Run ESLint
```

### GitHub Issue Management

When working with GitHub issues, use the `gh` CLI command:

```bash
gh issue list                          # List all open issues
```

**Note**: For all GitHub-related operations (viewing, creating, editing, closing issues), always use `gh` commands via the Bash tool.

### Git Worktree Management

Use the `./wt` script to create isolated worktrees for feature branches:

```bash
./wt feature/new-feature              # Create worktree for new branch
./wt feature/existing-branch          # Create worktree for existing branch
```

## Environment Setup

Required environment variables (see `.env.example`):
- `ANTHROPIC_API_KEY` - For Claude models (required)

## Documentation

- **[README.md](./README.md)** - Overview, quick start, and architecture
- **[TOOLS.md](./TOOLS.md)** - Creating custom MCP tools (refer to this when building new tools)
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions (refer to this when debugging)

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
├── CLAUDE.md                       # This file
├── README.md                       # Overview and quick start
├── TOOLS.md                        # Tool creation guide
└── TROUBLESHOOTING.md              # Troubleshooting guide
```
