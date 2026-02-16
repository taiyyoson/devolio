import { resolvePath, getNode } from "./pathUtils";

export function cd(args, context) {
  const target = args[0];
  const newPath = resolvePath(context.cwd, target);
  const node = getNode(context.fileSystem, newPath);

  if (!node) {
    return {
      output: [{ type: "error", content: `cd: ${target}: No such file or directory` }],
    };
  }

  if (node.type === "file") {
    return {
      output: [{ type: "error", content: `cd: ${target}: Not a directory` }],
    };
  }

  return { output: [], newCwd: newPath };
}
