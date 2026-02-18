export function date() {
  return {
    output: [{ type: "output", content: new Date().toString() }],
  };
}
