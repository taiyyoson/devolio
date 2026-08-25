export function login(args, context) {
  if (context.isAuthenticated) {
    return { output: [{ type: "system", content: "Already authenticated." }] };
  }

  return {
    output: [{ type: "system", content: "Redirecting to GitHub..." }],
    action: "login",
  };
}
