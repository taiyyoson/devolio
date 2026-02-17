/**
 * Parse raw terminal input into a command name and arguments.
 * Handles quoted strings and extra whitespace.
 */
export function parseInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return { command: "", args: [] };

  const parts = trimmed.split(/\s+/);
  return {
    command: parts[0].toLowerCase(),
    args: parts.slice(1),
  };
}
