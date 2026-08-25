export function login() {
  return {
    output: [
      { type: "error", content: "login: no authentication provider configured." },
      { type: "system", content: "GitHub OAuth is being wired up." },
    ],
  };
}
