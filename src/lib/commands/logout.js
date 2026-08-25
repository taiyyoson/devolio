export function logout(args, context) {
  if (!context.isAuthenticated) {
    return { output: [{ type: "system", content: "Not authenticated." }] };
  }

  return {
    output: [{ type: "system", content: "Signing out..." }],
    action: "logout",
  };
}
