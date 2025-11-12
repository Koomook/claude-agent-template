"use client";

import cn from "classnames";
import Markdown from "react-markdown";
import { markdownComponents } from "./markdown-components";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, SpinnerIcon } from "./icons";
import { UIMessage } from "ai";

interface ReasoningPart {
  type: "reasoning";
  text: string;
}

interface ReasoningMessagePartProps {
  part: ReasoningPart;
  isReasoning: boolean;
}

export function ReasoningMessagePart({
  part,
  isReasoning,
}: ReasoningMessagePartProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: 0,
    },
  };

  useEffect(() => {
    if (!isReasoning) {
      setIsExpanded(false);
    }
  }, [isReasoning]);

  return (
    <div className="flex flex-col">
      {isReasoning ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="text-sm font-medium">Reasoning</div>
          <div className="animate-spin">
            <SpinnerIcon />
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="text-sm font-medium">Reasoned for a few seconds</div>
          <button
            className={cn(
              "rounded-full cursor-pointer dark:hover:bg-zinc-800 hover:bg-zinc-200",
              {
                "dark:bg-zinc-800 bg-zinc-200": isExpanded,
              },
            )}
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="reasoning"
            className="flex flex-col gap-4 pl-3 text-sm border-l dark:text-zinc-400 text-zinc-600 dark:border-zinc-800"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Markdown components={markdownComponents}>
              {part.text}
            </Markdown>

            {/* <Markdown components={markdownComponents}>{reasoning}</Markdown> */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TextMessagePartProps {
  text: string;
}

export function TextMessagePart({ text }: TextMessagePartProps) {
  return (
    <div className="flex flex-col gap-4">
      <Markdown components={markdownComponents}>{text}</Markdown>
    </div>
  );
}

interface ToolMessagePartProps {
  toolName: string;
  toolInput: Record<string, unknown>;
  toolResult?: unknown;
}

export function ToolMessagePart({ toolName, toolInput, toolResult }: ToolMessagePartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format tool result for display
  const formatToolResult = (result: unknown): string => {
    if (typeof result === "string") {
      return result;
    }
    if (Array.isArray(result)) {
      // Handle array of content blocks (text/image)
      return result.map(block => {
        if (typeof block === "object" && block !== null) {
          const b = block as Record<string, unknown>;
          if (b.type === "text") {
            return String(b.text || "");
          }
        }
        return JSON.stringify(block, null, 2);
      }).join("\n");
    }
    return JSON.stringify(result, null, 2);
  };

  return (
    <div className="flex flex-col gap-2 dark:bg-zinc-900 bg-zinc-50 border dark:border-zinc-700 border-zinc-300 rounded-lg p-3">
      <div className="flex flex-row gap-2 items-center justify-between">
        <div className="flex flex-row gap-2 items-center">
          <span className="text-lg">🛠️</span>
          <span className="text-sm font-medium dark:text-zinc-200 text-zinc-800">
            Tool: <span className="dark:text-blue-400 text-blue-600">{toolName}</span>
            {toolResult && <span className="ml-2 dark:text-green-400 text-green-600">✓</span>}
          </span>
        </div>
        <button
          className="rounded-full cursor-pointer dark:hover:bg-zinc-800 hover:bg-zinc-200 p-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden flex flex-col gap-3"
          >
            <div>
              <div className="text-xs font-medium dark:text-zinc-400 text-zinc-600 mb-1">Input:</div>
              <pre className="text-xs dark:text-zinc-400 text-zinc-600 overflow-x-auto p-2 dark:bg-zinc-950 bg-zinc-100 rounded">
                {JSON.stringify(toolInput, null, 2)}
              </pre>
            </div>

            {toolResult && (
              <div>
                <div className="text-xs font-medium dark:text-zinc-400 text-zinc-600 mb-1">Result:</div>
                <pre className="text-xs dark:text-zinc-300 text-zinc-700 overflow-x-auto p-2 dark:bg-zinc-950 bg-zinc-100 rounded max-h-60 overflow-y-auto">
                  {formatToolResult(toolResult)}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MessagesProps {
  messages: Array<UIMessage>;
  status: "error" | "submitted" | "streaming" | "ready";
}

export function Messages({ messages, status }: MessagesProps) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const messagesLength = useMemo(() => messages.length, [messages]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messagesLength]);

  // Check if we should show loading indicator
  // Show loading while agent is working, until we get a final text response
  const isWaitingForResponse = status === "streaming" || status === "submitted";
  const lastMessage = messages[messages.length - 1];

  // Check if last message is a final text response (not tool usage)
  const hasTextResponse = lastMessage &&
    lastMessage.role === "assistant" &&
    lastMessage.parts.some(part => part.type === "text" && (part as any).text?.length > 0);

  // Show loading if we're waiting AND (no messages OR last is user OR last is tool usage)
  const shouldShowLoading = isWaitingForResponse && !hasTextResponse;

  return (
    <div
      className="flex overflow-y-scroll flex-col gap-8 items-center w-full"
      ref={messagesRef}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex flex-col gap-4 w-full last-of-type:mb-12 first-of-type:mt-16",
          )}
        >
          <div
            className={cn("flex flex-col gap-4", {
              "dark:bg-zinc-800 bg-zinc-200 p-2 rounded-xl w-fit ml-auto":
                message.role === "user",
              "": message.role === "assistant",
            })}
          >
            {message.parts.map((part, partIndex) => {
              if (part.type === "text") {
                return (
                  <TextMessagePart
                    key={`${message.id}-${partIndex}`}
                    text={part.text}
                  />
                );
              }

              if (part.type === "reasoning") {
                return (
                  <ReasoningMessagePart
                    key={`${message.id}-${partIndex}`}
                    part={part}
                    isReasoning={
                      status === "streaming" &&
                      partIndex === message.parts.length - 1
                    }
                  />
                );
              }

              if (part.type === "tool") {
                return (
                  <ToolMessagePart
                    key={`${message.id}-${partIndex}`}
                    toolName={(part as any).toolName}
                    toolInput={(part as any).toolInput}
                    toolResult={(part as any).toolResult}
                  />
                );
              }
            })}
          </div>
        </div>
      ))}

      {shouldShowLoading && (
        <div className="mb-12 w-full flex flex-row gap-2 items-center text-zinc-500">
          <div className="animate-spin h-4 w-4 border-2 border-zinc-400 border-t-transparent rounded-full"></div>
          <span>Thinking...</span>
        </div>
      )}
    </div>
  );
}
