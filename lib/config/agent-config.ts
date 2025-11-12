export const agentConfig = {
  model: "claude-haiku-4-5" as const,
  maxTurns: 10 as const,
  allowedTools: [
    "Read",
    "Write",
    "Bash",
    "Grep",
    "Glob",
    "WebSearch",
    "WebFetch",
    "mcp__0__hello-world",
  ] as string[],
};
