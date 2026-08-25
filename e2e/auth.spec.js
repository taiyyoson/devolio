import { test, expect } from "@playwright/test";
import { openTerminal, runCommand } from "./helpers/terminal";

test.describe("Terminal auth", () => {
  test.beforeEach(async ({ page }) => {
    await openTerminal(page);
  });

  test("/login shows email prompt", async ({ page }) => {
    await runCommand(page, "/login");
    const text = await page.textContent("body");
    expect(text).toContain("Starting login");
  });

  test("/login is listed in help", async ({ page }) => {
    await runCommand(page, "help");
    const text = await page.textContent("body");
    expect(text).toContain("/login");
  });

  test("/kanban denies access when not authenticated", async ({ page }) => {
    await runCommand(page, "/kanban");
    const text = await page.textContent("body");
    expect(text).toContain("Access denied");
    expect(text).toContain("/login");
  });
});
