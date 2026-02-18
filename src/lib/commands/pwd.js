export function pwd(args, context) {
  const display = context.cwd === "~" ? "/home/taiyo" : context.cwd.replace("~", "/home/taiyo");
  return {
    output: [{ type: "output", content: display }],
  };
}
