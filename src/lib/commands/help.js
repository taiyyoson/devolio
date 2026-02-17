export function help() {
  return {
    output: [
      { type: "output", content: "Available commands:" },
      { type: "output", content: "" },
      { type: "output", content: "  help              Show this help message" },
      { type: "output", content: "  ls [dir]          List directory contents" },
      { type: "output", content: "  cd <dir>          Change directory" },
      { type: "output", content: "  cat <file>        Display file contents" },
      { type: "output", content: "  clear             Clear the terminal" },
      { type: "output", content: "  whoami            Display user info" },
      { type: "output", content: "  open <url>        Open a URL in a new tab" },
      { type: "output", content: "  theme             Toggle dark/light mode" },
      { type: "output", content: "  /login            Admin login" },
      { type: "output", content: "  /kanban           Open kanban board (admin only)" },
    ],
  };
}
