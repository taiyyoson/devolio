import { resolvePath, getNode } from "./pathUtils";

export function cat(args, context) {
  if (!args[0]) {
    return {
      output: [{ type: "error", content: "cat: missing file operand" }],
    };
  }

  const target = resolvePath(context.cwd, args[0]);
  const node = getNode(context.fileSystem, target);

  if (!node) {
    return {
      output: [{ type: "error", content: `cat: ${args[0]}: No such file or directory` }],
    };
  }

  if (node.type === "directory") {
    return {
      output: [{ type: "error", content: `cat: ${args[0]}: Is a directory` }],
    };
  }

  const lines = node.content.split("\n").map((line) => ({
    type: "output",
    content: line,
  }));

  return { output: lines };
}
