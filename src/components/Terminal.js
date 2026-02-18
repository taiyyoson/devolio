"use client";

import { useReducer, useRef, useEffect, useCallback } from "react";
import TerminalLine from "./terminal/TerminalLine";
import TerminalInput from "./terminal/TerminalInput";
import { buildFileSystem } from "@/lib/filesystem";
import { executeCommand, commandNames } from "@/lib/commands";
import { createClient } from "@/lib/supabase/client";
import KanbanOverlay from "./kanban/KanbanOverlay";

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
  showKanban: false,
  loginMode: null, // null | "email" | "password"
  loginEmail: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, currentInput: action.value };

    case "SUBMIT": {
      const input = state.currentInput.trim();

      // Handle login flow
      if (state.loginMode === "email") {
        return {
          ...state,
          history: [
            ...state.history,
            { type: "output", content: `email: ${input}` },
          ],
          currentInput: "",
          loginMode: "password",
          loginEmail: input,
        };
      }

      if (state.loginMode === "password") {
        return {
          ...state,
          history: [
            ...state.history,
            { type: "output", content: "password: " + "*".repeat(input.length) },
            { type: "system", content: "Authenticating..." },
          ],
          currentInput: "",
          loginMode: null,
          _pendingLogin: { email: state.loginEmail, password: input },
          loginEmail: "",
        };
      }

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
      } else if (result.action === "login") {
        newState.loginMode = "email";
      } else if (result.action === "kanban") {
        newState.showKanban = true;
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
      return { ...state, _pendingOpen: undefined, _pendingTheme: undefined, _pendingLogin: undefined, _pendingGui: undefined };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        history: [...state.history, { type: "system", content: "Authenticated as admin." }],
      };

    case "LOGIN_FAILURE":
      return {
        ...state,
        history: [...state.history, { type: "error", content: `Authentication failed: ${action.message}` }],
      };

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

    case "TOGGLE_KANBAN":
      return { ...state, showKanban: !state.showKanban };

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

  // Check existing session on mount
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) dispatch({ type: "SET_AUTH", value: true });
    });
  }, []);

  // Handle side effects (open URL, toggle theme, login)
  useEffect(() => {
    if (state._pendingOpen) {
      window.open(state._pendingOpen, "_blank");
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
    if (state._pendingLogin) {
      const { email, password } = state._pendingLogin;
      dispatch({ type: "CLEAR_SIDE_EFFECTS" });
      const supabase = createClient();
      if (!supabase) {
        dispatch({ type: "LOGIN_FAILURE", message: "Supabase not configured" });
        return;
      }
      supabase.auth.signInWithPassword({ email, password }).then(({ error }) => {
        if (error) {
          dispatch({ type: "LOGIN_FAILURE", message: error.message });
        } else {
          dispatch({ type: "LOGIN_SUCCESS" });
        }
      });
    }
  }, [state._pendingOpen, state._pendingTheme, state._pendingLogin, state._pendingGui, onToggleView]);

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
          loginMode={state.loginMode}
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
            type={state.loginMode === "password" ? "password" : "text"}
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

      {state.showKanban && (
        <KanbanOverlay onClose={() => dispatch({ type: "TOGGLE_KANBAN" })} />
      )}
    </div>
  );
}
