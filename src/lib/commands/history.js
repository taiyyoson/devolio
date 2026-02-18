export function history(args, context) {
  const entries = context.commandHistory || [];
  if (entries.length === 0) {
    return { output: [{ type: "output", content: "No commands in history." }] };
  }
  return {
    output: entries.map((cmd, i) => ({
      type: "output",
      content: `  ${String(i + 1).padStart(4)}  ${cmd}`,
    })),
  };
}
