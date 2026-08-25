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

// The boot code comes from a URL hash, which anyone can set. It may drive the
// view and one of these fixed messages — never authentication state. That comes
// only from /api/auth/me.
const BOOT_MESSAGES = {
  ok: { type: "system", content: "Login complete." },
  already: { type: "system", content: "Already authenticated." },
  denied: { type: "error", content: "Login cancelled." },
  forbidden: { type: "error", content: "Access denied — that GitHub account is not the owner." },
  not_configured: { type: "error", content: "Login is not configured." },
  rate_limited: { type: "error", content: "Too many login attempts. Wait a minute." },
  invalid_request: { type: "error", content: "Login failed — malformed callback." },
  state_missing: { type: "error", content: "Login expired. Try again." },
  state_mismatch: { type: "error", content: "Login failed — state mismatch." },
  exchange_failed: { type: "error", content: "Login failed — could not reach GitHub." },
};

const initialState = {
  history: [...WELCOME_LINES],
  currentInput: "",
  cwd: "~",
  isAuthenticated: false,
  githubLogin: null,
  commandHistory: [],
};

function init(boot) {
  const line = boot ? BOOT_MESSAGES[boot] : null;
  return line ? { ...initialState, history: [...WELCOME_LINES, line] } : initialState;
}

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
      } else if (result.action === "login") {
        newState._pendingAuthRedirect = true;
      } else if (result.action === "logout") {
        newState._pendingLogout = true;
      }

      return newState;
    }

    case "CLEAR_SIDE_EFFECTS":
      return { ...state, _pendingOpen: undefined, _pendingTheme: undefined, _pendingGui: undefined, _pendingAuthRedirect: undefined, _pendingLogout: undefined };

    case "SET_AUTH": {
      // Idempotent: StrictMode double-invokes effects in dev and this appends
      // history, so a naive version prints "Authenticated as ..." twice.
      const login = action.login ?? null;
      if (state.isAuthenticated === action.value && state.githubLogin === login) return state;
      return {
        ...state,
        isAuthenticated: action.value,
        githubLogin: login,
        history: action.value
          ? [...state.history, { type: "system", content: `Authenticated as ${login}.` }]
          : state.history,
      };
    }

    case "LOGOUT_DONE":
      return {
        ...state,
        isAuthenticated: false,
        githubLogin: null,
        history: [...state.history, { type: "system", content: "Signed out." }],
      };

    case "AUTH_ERROR":
      return { ...state, history: [...state.history, { type: "error", content: action.message }] };

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

export default function Terminal({ onToggleView, boot = null }) {
  const [state, dispatch] = useReducer(reducer, boot, init);
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
    if (state._pendingAuthRedirect) {
      dispatch({ type: "CLEAR_SIDE_EFFECTS" });
      // Full page navigation, not router.push: this route 303s to github.com,
      // and a client-side transition cannot follow a cross-origin redirect.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/api/auth/login");
    }
    if (state._pendingLogout) {
      dispatch({ type: "CLEAR_SIDE_EFFECTS" });
      fetch("/api/auth/logout", { method: "POST" })
        .then((r) =>
          dispatch(r.ok ? { type: "LOGOUT_DONE" } : { type: "AUTH_ERROR", message: "Sign out failed." })
        )
        .catch(() => dispatch({ type: "AUTH_ERROR", message: "Sign out failed." }));
    }
  }, [
    state._pendingOpen,
    state._pendingTheme,
    state._pendingGui,
    state._pendingAuthRedirect,
    state._pendingLogout,
    onToggleView,
  ]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.authenticated) {
          dispatch({ type: "SET_AUTH", value: true, login: d.login });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
