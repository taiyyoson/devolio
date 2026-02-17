import { test, expect } from "@playwright/test";
import { runCommand, getOutputLines } from "./helpers/terminal";

test.describe("Terminal basics", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("input");
  });

  test("shows welcome message on load", async ({ page }) => {
    const text = await page.textContent("body");
    expect(text).toContain("Welcome to devolio");
    expect(text).toContain('Type "help"');
  });

  test("help command lists available commands", async ({ page }) => {
    await runCommand(page, "help");
    const text = await page.textContent("body");
    expect(text).toContain("Available commands:");
    expect(text).toContain("ls");
    expect(text).toContain("cd");
    expect(text).toContain("cat");
    expect(text).toContain("whoami");
  });

  test("whoami shows user info", async ({ page }) => {
    await runCommand(page, "whoami");
    const text = await page.textContent("body");
    expect(text).toContain("taiyo");
    expect(text).toContain("University of San Francisco");
  });

  test("clear removes history", async ({ page }) => {
    await runCommand(page, "help");
    await runCommand(page, "clear");
    const text = await page.textContent("body");
    expect(text).not.toContain("Available commands:");
  });

  test("unknown command shows error", async ({ page }) => {
    await runCommand(page, "asdfnotreal");
    const text = await page.textContent("body");
    expect(text).toContain("Command not found: asdfnotreal");
  });

  test("empty input renders blank prompt", async ({ page }) => {
    await page.keyboard.press("Enter");
    // Should not crash, just add a prompt line
    const text = await page.textContent("body");
    expect(text).toContain("taiyo@devolio");
  });
});
