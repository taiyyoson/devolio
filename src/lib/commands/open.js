export function open(args) {
  if (!args[0]) {
    return {
      output: [{ type: "error", content: "open: missing URL operand" }],
    };
  }

  let url = args[0];
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    new URL(url);
  } catch {
    return {
      output: [{ type: "error", content: `open: invalid URL: ${args[0]}` }],
    };
  }

  return {
    output: [{ type: "system", content: `Opening ${url} ...` }],
    action: "open",
    actionData: url,
  };
}
