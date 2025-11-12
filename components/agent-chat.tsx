"use client";

import cn from "classnames";
import { Messages } from "./messages";
import { Footnote } from "./footnote";
import { ArrowUpIcon, StopIcon } from "./icons";
import { Input } from "./input";
import { useAgent } from "./hooks/use-agent";
import { ExamplePrompts } from "./ui/example-prompts";

export function AgentChat() {
  const {
    input,
    setInput,
    messages,
    isGenerating,
    sendMessage,
    stop,
  } = useAgent();

  return (
    <div
      className={cn(
        "px-4 md:px-0 pb-4 pt-8 flex flex-col h-dvh items-center w-full max-w-3xl",
        {
          "justify-between": messages.length > 0,
          "justify-center gap-4": messages.length === 0,
        },
      )}
    >
      {messages.length > 0 ? (
        <Messages messages={messages} status={isGenerating ? "streaming" : "ready"} />
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-0.5 sm:text-2xl text-xl w-full">
            <div className="flex flex-row gap-2 items-center">
              <div>Claude Agent Template</div>
            </div>
            <div className="dark:text-zinc-500 text-zinc-400">
              AI Agent powered by Claude Agent SDK with custom MCP tools
            </div>
            <div className="dark:text-zinc-600 text-zinc-500 text-sm mt-2">
              Multi-turn agentic workflows · Custom tool integration · Real-time streaming
            </div>
          </div>

          <ExamplePrompts onSelectPrompt={sendMessage} />
        </div>
      )}

      <div className="flex flex-col gap-4 w-full">
        <div className="flex relative flex-col gap-1 p-3 w-full rounded-2xl dark:bg-zinc-800 bg-zinc-100">
          <Input
            input={input}
            setInput={setInput}
            selectedModelId="sonnet-3.7"
            isGeneratingResponse={isGenerating}
            isReasoningEnabled={false}
            onSubmit={sendMessage}
          />

          <div className="absolute bottom-2.5 right-2.5 flex flex-row gap-2">
            <button
              className={cn(
                "size-8 flex flex-row justify-center items-center dark:bg-zinc-100 bg-zinc-900 dark:text-zinc-900 text-zinc-100 p-1.5 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-300 hover:scale-105 active:scale-95 transition-all",
                {
                  "dark:bg-zinc-200 dark:text-zinc-500":
                    isGenerating || input === "",
                },
              )}
              onClick={() => {
                if (input === "") {
                  return;
                }

                if (isGenerating) {
                  stop();
                } else {
                  sendMessage();
                }
              }}
            >
              {isGenerating ? <StopIcon /> : <ArrowUpIcon />}
            </button>
          </div>
        </div>

        <Footnote />
      </div>
    </div>
  );
}
