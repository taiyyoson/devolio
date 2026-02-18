import { useRef, useEffect, useState } from "react";
import { resolvePath, getNode } from "@/lib/commands/pathUtils";

const PATH_COMMANDS = new Set(["cd", "ls", "cat", "open"]);

function getCompletions(input, commands, fileSystem, cwd) {
  const parts = input.split(/\s+/);

  // Complete command name
  if (parts.length <= 1) {
    const prefix = parts[0] || "";
    return commands
      .filter((c) => c.startsWith(prefix) && c !== prefix)
      .map((c) => c);
  }

  // Complete path argument
  const cmd = parts[0];
  if (!PATH_COMMANDS.has(cmd)) return [];

  const partial = parts[parts.length - 1];
  // Split partial into directory part and name prefix
  const lastSlash = partial.lastIndexOf("/");
  let dirPart, namePrefix;
  if (lastSlash === -1) {
    dirPart = "";
    namePrefix = partial;
  } else {
    dirPart = partial.slice(0, lastSlash + 1);
    namePrefix = partial.slice(lastSlash + 1);
  }

  // Resolve the directory
  const dirPath = dirPart ? resolvePath(cwd, dirPart) : cwd;
  const dirNode = getNode(fileSystem, dirPath);
  if (!dirNode || dirNode.type !== "directory") return [];

  // Find matching children
  return Object.keys(dirNode.children)
    .filter((name) => name.startsWith(namePrefix) && name !== namePrefix)
    .map((name) => {
      const suffix = dirNode.children[name].type === "directory" ? "/" : "";
      return dirPart + name + suffix;
    });
}

export default function TerminalInput({
  cwd,
  value,
  onChange,
  onSubmit,
  loginMode,
  commands = [],
  fileSystem,
  commandHistory = [],
}) {
  const inputRef = useRef(null);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const savedInput = useRef("");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset history index when value changes from typing (not from history nav)
  const historyNavRef = useRef(false);
  useEffect(() => {
    if (!historyNavRef.current) {
      setHistoryIndex(-1);
    }
    historyNavRef.current = false;
  }, [value]);

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      setHistoryIndex(-1);
      onSubmit();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      if (loginMode) return;
      const matches = getCompletions(value, commands, fileSystem, cwd);
      if (matches.length === 1) {
        const parts = value.split(/\s+/);
        if (parts.length <= 1) {
          // Replace command
          onChange(matches[0]);
        } else {
          // Replace last argument
          parts[parts.length - 1] = matches[0];
          onChange(parts.join(" "));
        }
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (loginMode || commandHistory.length === 0) return;
      const newIndex = historyIndex + 1;
      if (newIndex >= commandHistory.length) return;
      if (historyIndex === -1) {
        savedInput.current = value;
      }
      historyNavRef.current = true;
      setHistoryIndex(newIndex);
      onChange(commandHistory[commandHistory.length - 1 - newIndex]);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (loginMode) return;
      const newIndex = historyIndex - 1;
      if (newIndex < -1) return;
      historyNavRef.current = true;
      setHistoryIndex(newIndex);
      if (newIndex === -1) {
        onChange(savedInput.current);
      } else {
        onChange(commandHistory[commandHistory.length - 1 - newIndex]);
      }
      return;
    }
  }

  const promptLabel = loginMode === "email"
    ? "email: "
    : loginMode === "password"
    ? "password: "
    : null;

  return (
    <div className="flex gap-0 items-center whitespace-pre" onClick={() => inputRef.current?.focus()}>
      {promptLabel ? (
        <span className="text-yellow-400">{promptLabel}</span>
      ) : (
        <>
          <span className="text-green-400">taiyo@devolio</span>
          <span className="text-gray-500">:</span>
          <span className="text-blue-400">{cwd}</span>
          <span className="text-gray-500">$ </span>
        </>
      )}
      <div className="relative flex-1 min-w-0">
        <input
          ref={inputRef}
          type={loginMode === "password" ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => inputRef.current?.focus(), 10)}
          className="absolute inset-0 w-full bg-transparent text-gray-300 outline-none caret-transparent"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <span className="invisible">{loginMode === "password" ? "*".repeat(value.length) : value}</span>
        <span className="inline-block w-[0.6em] h-[1.1em] bg-gray-300 align-middle animate-blink" />
      </div>
    </div>
  );
}
