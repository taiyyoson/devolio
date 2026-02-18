export function echo(args) {
  return {
    output: [{ type: "output", content: args.join(" ") }],
  };
}
