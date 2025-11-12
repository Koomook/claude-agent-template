import Link from 'next/link';

export function Footnote() {
  return (
    <div className="text-xs text-zinc-400 leading-5 hidden sm:block">
      <strong>Claude Agent Template</strong> - A Next.js template for building AI agents with Claude Agent SDK and custom MCP tools.
      Add your own tools to extend the agent's capabilities for your use case.
    </div>
  );
}
