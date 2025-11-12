import { AgentChat } from "@/components/agent-chat";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claude Agent Template",
  description: "AI Agent powered by Claude Agent SDK with custom MCP tools",
};

export default function Home() {
  return (
    <div className="flex flex-col size-full items-center">
      <AgentChat />
    </div>
  );
}
