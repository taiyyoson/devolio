/**
 * Load the site and switch from the portfolio landing view into the terminal.
 * The app renders the portfolio first, so specs must open the terminal
 * explicitly before any input exists.
 */
export async function openTerminal(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Open terminal" }).click();
  await page.locator("input").first().waitFor();
}

/**
 * Type a command into the terminal and press Enter.
 */
export async function runCommand(page, command) {
  await page.locator("input").first().fill(command);
  await page.keyboard.press("Enter");
}

/**
 * Get all visible text lines from the terminal output.
 */
export async function getOutputLines(page) {
  const lines = await page.locator(".flex-1.overflow-y-auto > div").allTextContents();
  return lines.map((l) => l.trim()).filter(Boolean);
}
