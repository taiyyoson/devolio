import { resolvePath, getNode } from "./pathUtils";

export function ls(args, context) {
  const target = args[0] ? resolvePath(context.cwd, args[0]) : context.cwd;
  const node = getNode(context.fileSystem, target);

  if (!node) {
    return {
      output: [{ type: "error", content: `ls: ${args[0]}: No such file or directory` }],
    };
  }

  if (node.type === "file") {
    return {
      output: [{ type: "output", content: args[0] || target.split("/").pop() }],
    };
  }

  const entries = Object.keys(node.children).sort((a, b) => {
    const aDir = node.children[a].type === "directory";
    const bDir = node.children[b].type === "directory";
    if (aDir && !bDir) return -1;
    if (!aDir && bDir) return 1;
    return a.localeCompare(b);
  });

  const output = entries.map((name) => {
    const isDir = node.children[name].type === "directory";
    return {
      type: isDir ? "directory" : "output",
      content: isDir ? `${name}/` : name,
    };
  });

  return { output };
}
