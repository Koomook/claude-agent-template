interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const examples = [
  {
    title: "Hello World Tool",
    description: "Test the example MCP tool with multilingual greetings",
    prompt: "Say hello to Alice in Korean",
  },
  {
    title: "File Operations",
    description: "Use built-in Read tool to access files",
    prompt: "Read the README.md file and summarize what this template does",
  },
  {
    title: "Code Search",
    description: "Use Grep tool to search through code",
    prompt: "Search for 'tool' in the codebase and show me where custom tools are defined",
  },
  {
    title: "Agent Capabilities",
    description: "Learn about available tools and features",
    prompt: "What custom tools are available?",
  },
];

export function ExamplePrompts({ onSelectPrompt }: ExamplePromptsProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="text-sm dark:text-zinc-400 text-zinc-600 font-medium">
        Try these examples
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(example.prompt)}
            className="text-left p-4 rounded-lg border dark:border-zinc-700 border-zinc-200 dark:bg-zinc-800/50 bg-zinc-50 hover:dark:bg-zinc-800 hover:bg-zinc-100 transition-colors"
          >
            <div className="text-sm font-medium dark:text-zinc-200 text-zinc-800">
              {example.title}
            </div>
            <div className="text-xs dark:text-zinc-500 text-zinc-600 mt-1">
              {example.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
