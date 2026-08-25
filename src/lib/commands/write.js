export function write(args, context) {
  if (!context.isAuthenticated) {
    return {
      output: [
        { type: "error", content: "Access denied — admin only." },
        { type: "system", content: 'Use "/login" to authenticate.' },
      ],
    };
  }

  return {
    output: [{ type: "system", content: "Opening editor..." }],
    action: "open",
    actionData: "/write",
  };
}
