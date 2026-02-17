/**
 * Resolve a target path relative to the current working directory.
 * Supports ~, .., ., absolute (~/) and relative paths.
 */
export function resolvePath(cwd, target) {
  if (!target || target === "~") return "~";

  let parts;
  if (target.startsWith("~/")) {
    // Absolute path from home
    parts = target.slice(2).split("/").filter(Boolean);
  } else if (target.startsWith("..")) {
    parts = cwd === "~" ? [] : cwd.slice(2).split("/").filter(Boolean);
    const segments = target.split("/").filter(Boolean);
    for (const seg of segments) {
      if (seg === "..") {
        parts.pop();
      } else if (seg !== ".") {
        parts.push(seg);
      }
    }
  } else {
    // Relative path
    parts = cwd === "~" ? [] : cwd.slice(2).split("/").filter(Boolean);
    const segments = target.split("/").filter(Boolean);
    for (const seg of segments) {
      if (seg === "..") {
        parts.pop();
      } else if (seg !== ".") {
        parts.push(seg);
      }
    }
  }

  return parts.length === 0 ? "~" : "~/" + parts.join("/");
}

/**
 * Get a node from the filesystem tree by absolute path.
 * Returns null if the path doesn't exist.
 */
export function getNode(fileSystem, absolutePath) {
  if (absolutePath === "~") return fileSystem;

  const parts = absolutePath.slice(2).split("/").filter(Boolean);
  let current = fileSystem;

  for (const part of parts) {
    if (!current || current.type !== "directory" || !current.children[part]) {
      return null;
    }
    current = current.children[part];
  }

  return current;
}
