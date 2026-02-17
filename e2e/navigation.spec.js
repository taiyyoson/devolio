import { test, expect } from "@playwright/test";
import { runCommand } from "./helpers/terminal";

test.describe("Filesystem navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("input");
  });

  test("ls shows root directory contents", async ({ page }) => {
    await runCommand(page, "ls");
    const text = await page.textContent("body");
    expect(text).toContain("about.txt");
    expect(text).toContain("contact.txt");
    expect(text).toContain("projects/");
    expect(text).toContain("experience/");
    expect(text).toContain("publications/");
  });

  test("cd into projects and ls shows project dirs", async ({ page }) => {
    await runCommand(page, "cd projects");
    await runCommand(page, "ls");
    const text = await page.textContent("body");
    expect(text).toContain("nala/");
    expect(text).toContain("particle-simulator/");
    expect(text).toContain("chore-mate/");
  });

  test("cat about.txt shows bio", async ({ page }) => {
    await runCommand(page, "cat about.txt");
    const text = await page.textContent("body");
    expect(text).toContain("Taiyo Williamson");
    expect(text).toContain("University of San Francisco");
  });

  test("cd into project and cat README.md", async ({ page }) => {
    await runCommand(page, "cd projects/nala");
    await runCommand(page, "cat README.md");
    const text = await page.textContent("body");
    expect(text).toContain("Nala");
    expect(text).toContain("RAG");
  });

  test("cd .. navigates up", async ({ page }) => {
    await runCommand(page, "cd projects");
    await runCommand(page, "cd ..");
    await runCommand(page, "ls");
    const text = await page.textContent("body");
    expect(text).toContain("about.txt");
  });

  test("cd ~ returns to root", async ({ page }) => {
    await runCommand(page, "cd projects/nala");
    await runCommand(page, "cd ~");
    await runCommand(page, "ls");
    const text = await page.textContent("body");
    expect(text).toContain("about.txt");
  });

  test("invalid path shows error", async ({ page }) => {
    await runCommand(page, "cd nonexistent");
    const text = await page.textContent("body");
    expect(text).toContain("No such file or directory");
  });

  test("cd into file shows error", async ({ page }) => {
    await runCommand(page, "cd about.txt");
    const text = await page.textContent("body");
    expect(text).toContain("Not a directory");
  });

  test("cat on directory shows error", async ({ page }) => {
    await runCommand(page, "cat projects");
    const text = await page.textContent("body");
    expect(text).toContain("Is a directory");
  });
});
