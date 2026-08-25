export function kanban(args, context) {
  if (!context.isAuthenticated) {
    return {
      output: [
        { type: "error", content: "Access denied — admin only." },
        { type: "system", content: 'Use "/login" to authenticate.' },
      ],
    };
  }

  return {
    output: [{ type: "output", content: "kanban: no boards found." }],
  };
}
