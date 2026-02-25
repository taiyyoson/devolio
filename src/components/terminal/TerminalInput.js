import { useRef, useEffect, useState, useCallback } from "react";
import { resolvePath, getNode } from "@/lib/commands/pathUtils";

const PATH_COMMANDS = new Set(["cd", "ls", "cat", "open"]);

function getCompletions(input, commands, fileSystem, cwd) {
  const trimmed = input.trimStart();
  const spaceIndex = trimmed.indexOf(" ");
  const isCompletingCommand = spaceIndex === -1;

  // Complete command name
  if (isCompletingCommand) {
    const prefix = trimmed;
    return {
      matches: commands.filter((c) => c.startsWith(prefix)),
      token: prefix,
      isCommand: true,
    };
  }

  // Complete path argument for path-aware commands
  const cmd = trimmed.slice(0, spaceIndex);
  if (!PATH_COMMANDS.has(cmd)) return { matches: [], token: "", isCommand: false };

  // Get the partial path after the last space
  const afterCmd = trimmed.slice(spaceIndex + 1);
  const lastSpace = afterCmd.lastIndexOf(" ");
  const partial = lastSpace === -1 ? afterCmd : afterCmd.slice(lastSpace + 1);

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
  if (!dirNode || dirNode.type !== "directory") return { matches: [], token: partial, isCommand: false };

  // Find matching children
  const matches = Object.keys(dirNode.children)
    .filter((name) => name.startsWith(namePrefix))
    .map((name) => {
      const suffix = dirNode.children[name].type === "directory" ? "/" : "";
      return dirPart + name + suffix;
    });

  return { matches, token: partial, isCommand: false };
}

function longestCommonPrefix(strings) {
  if (strings.length === 0) return "";
  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
    }
  }
  return prefix;
}

export default function TerminalInput({
  cwd,
  value,
  onChange,
  onSubmit,
  onShowCompletions,
  loginMode,
  commands = [],
  fileSystem,
  commandHistory = [],
}) {
  const inputRef = useRef(null);
  const historyIndexRef = useRef(-1);
  const savedInput = useRef("");
  const [, forceRender] = useState(0);

  const setHistoryIndex = useCallback((idx) => {
    historyIndexRef.current = idx;
    forceRender((n) => n + 1);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      const { matches, token, isCommand } = getCompletions(value, commands, fileSystem, cwd);
      if (matches.length === 0) return;

      // Build the completed input with a given replacement token
      const applyCompletion = (completed) => {
        if (isCommand) {
          return completed;
        }
        // Replace the last token in the input
        const lastTokenStart = value.lastIndexOf(token);
        return value.slice(0, lastTokenStart) + completed;
      };

      if (matches.length === 1) {
        let completed = matches[0];
        // Add trailing space after commands and files (not dirs, they already have /)
        if (isCommand || !completed.endsWith("/")) {
          completed += " ";
        }
        onChange(applyCompletion(completed));
      } else {
        // Fill longest common prefix
        const common = longestCommonPrefix(matches);
        if (common.length > token.length) {
          onChange(applyCompletion(common));
        }
        // Display matches — show just the basename for readability
        const displayNames = matches.map((m) => {
          const parts = m.split("/").filter(Boolean);
          const name = parts[parts.length - 1] || m;
          return m.endsWith("/") ? name + "/" : name;
        });
        onShowCompletions(displayNames);
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (loginMode || commandHistory.length === 0) return;
      const newIndex = historyIndexRef.current + 1;
      if (newIndex >= commandHistory.length) return;
      if (historyIndexRef.current === -1) {
        savedInput.current = value;
      }
      setHistoryIndex(newIndex);
      onChange(commandHistory[commandHistory.length - 1 - newIndex]);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (loginMode) return;
      const newIndex = historyIndexRef.current - 1;
      if (newIndex < -1) return;
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
          onChange={(e) => {
            historyIndexRef.current = -1;
            onChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}

          onBlur={() => setTimeout(() => {
            const active = document.activeElement;
            const isInOverlay = active?.closest('[data-kanban-overlay]');
            if (!isInOverlay) {
              inputRef.current?.focus();
            }

          }, 10)}
          
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
