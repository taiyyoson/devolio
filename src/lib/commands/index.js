import { parseInput } from "./parser";
import { help } from "./help";
import { ls } from "./ls";
import { cd } from "./cd";
import { cat } from "./cat";
import { clear } from "./clear";
import { whoami } from "./whoami";
import { open } from "./open";
import { theme } from "./theme";
import { gui } from "./gui";
import { kanban } from "./kanban";
import { login } from "./login";
import { echo } from "./echo";
import { pwd } from "./pwd";
import { date } from "./date";
import { history } from "./history";

const commands = {
  help,
  ls,
  cd,
  cat,
  clear,
  whoami,
  open,
  theme,
  gui,
  echo,
  pwd,
  date,
  history,
  "/kanban": kanban,
  "/login": login,
};

export const commandNames = Object.keys(commands);

/**
 * Execute a raw input string against the command registry.
 * Returns { output, newCwd?, action?, actionData? }
 */
export function executeCommand(input, context) {
  const { command, args } = parseInput(input);

  if (!command) {
    return { output: [] };
  }

  const handler = commands[command];
  if (!handler) {
    return {
      output: [
        {
          type: "error",
          content: `Command not found: ${command}. Type "help" for available commands.`,
        },
      ],
    };
  }

  return handler(args, context);
}
