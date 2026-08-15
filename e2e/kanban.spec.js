import { test, expect } from "@playwright/test";
import { openTerminal, runCommand } from "./helpers/terminal";

test.describe("Kanban access control", () => {
  test.beforeEach(async ({ page }) => {
    await openTerminal(page);
  });

  test("/kanban shows access denied when not authenticated", async ({ page }) => {
    await runCommand(page, "/kanban");
    const text = await page.textContent("body");
    expect(text).toContain("Access denied");
    expect(text).toContain("/login");
  });

  test("/login shows email prompt", async ({ page }) => {
    await runCommand(page, "/login");
    const text = await page.textContent("body");
    expect(text).toContain("Starting login");
  });
});
