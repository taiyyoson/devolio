"use client";

import { useReducer, useRef, useEffect, useCallback } from "react";
import TerminalLine from "./terminal/TerminalLine";
import TerminalInput from "./terminal/TerminalInput";
import { buildFileSystem } from "@/lib/filesystem";
import { executeCommand, commandNames } from "@/lib/commands";

const fileSystem = buildFileSystem();

const WELCOME_LINES = [
  { type: "system", content: "Welcome to devolio — Taiyo Williamson's portfolio" },
  { type: "system", content: 'Type "help" for commands or "gui" for the traditional view.' },
  { type: "output", content: "" },
];

const initialState = {
  history: [...WELCOME_LINES],
  currentInput: "",
  cwd: "~",
  isAuthenticated: false,
  commandHistory: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, currentInput: action.value };

    case "SUBMIT": {
      const input = state.currentInput.trim();

      // Regular command execution
      const promptLine = { type: "prompt", cwd: state.cwd, content: input };
      const newCommandHistory = input ? [...state.commandHistory, input] : state.commandHistory;
      const context = {
        cwd: state.cwd,
        fileSystem,
        isAuthenticated: state.isAuthenticated,
        commandHistory: newCommandHistory,
      };
      const result = executeCommand(input, context);

      let newState = {
        ...state,
        currentInput: "",
        commandHistory: newCommandHistory,
        history: [...state.history, promptLine, ...result.output],
        cwd: result.newCwd || state.cwd,
      };

      // Handle special actions
      if (result.action === "clear") {
        newState.history = [];
      } else if (result.action === "open" && result.actionData) {
        // Side effect handled in component via useEffect
        newState._pendingOpen = result.actionData;
      } else if (result.action === "theme") {
        newState._pendingTheme = true;
      } else if (result.action === "gui") {
        newState._pendingGui = true;
      }

      return newState;
    }

    case "CLEAR_SIDE_EFFECTS":
      return { ...state, _pendingOpen: undefined, _pendingTheme: undefined, _pendingGui: undefined };

    case "SET_AUTH":
      return { ...state, isAuthenticated: action.value };

    case "SHOW_COMPLETIONS":
      return {
        ...state,
        history: [
          ...state.history,
          { type: "prompt", cwd: state.cwd, content: state.currentInput },
          { type: "output", content: action.matches.join("  ") },
        ],
      };

    default:
      return state;
  }
}

export default function Terminal({ onToggleView }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.history]);

  // Handle side effects (open URL, toggle theme, login)
  useEffect(() => {
    if (state._pendingOpen) {
      window.open(state._pendingOpen, "_blank", "noopener,noreferrer");
      dispatch({ type: "CLEAR_SIDE_EFFECTS" });
    }
    if (state._pendingTheme) {
      document.documentElement.classList.toggle("dark");
      const isDark = document.documentElement.classList.contains("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      dispatch({ type: "CLEAR_SIDE_EFFECTS" });
    }
    if (state._pendingGui) {
      dispatch({ type: "CLEAR_SIDE_EFFECTS" });
      if (onToggleView) onToggleView();
    }
  }, [state._pendingOpen, state._pendingTheme, state._pendingGui, onToggleView]);

  const handleSubmit = useCallback(() => {
    dispatch({ type: "SUBMIT" });
  }, []);

  const handleChange = useCallback((value) => {
    dispatch({ type: "SET_INPUT", value });
  }, []);

  const handleShowCompletions = useCallback((matches) => {
    dispatch({ type: "SHOW_COMPLETIONS", matches });
  }, []);

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] text-sm font-mono flex flex-col overflow-hidden">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 pb-2 scrollbar-thin"
      >
        {state.history.map((line, i) => (
          <TerminalLine key={i} line={line} />
        ))}
        <TerminalInput
          cwd={state.cwd}
          value={state.currentInput}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onShowCompletions={handleShowCompletions}
          commands={commandNames}
          fileSystem={fileSystem}
          commandHistory={state.commandHistory}
        />
      </div>

      {/* Mobile: visible input bar */}
      <div className="sm:hidden border-t border-gray-800 p-2 bg-[#111]">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="text-green-400">$</span>
          <input
            type="text"
            value={state.currentInput}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 bg-transparent text-gray-300 outline-none"
            placeholder="Type a command..."
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>
      </div>
    </div>
  );
}
