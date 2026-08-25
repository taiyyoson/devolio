import { test, expect } from "@playwright/test";
import { openTerminal, runCommand } from "./helpers/terminal";

test.describe("Terminal auth", () => {
  test.beforeEach(async ({ page }) => {
    await openTerminal(page);
  });

  test("/login reports that no provider is configured", async ({ page }) => {
    await runCommand(page, "/login");
    const text = await page.textContent("body");
    expect(text).toContain("no authentication provider configured");
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

  test("/write denies access when not authenticated", async ({ page }) => {
    await runCommand(page, "/write");
    const text = await page.textContent("body");
    expect(text).toContain("Access denied");
  });
});

test.describe("Publishing is closed with no auth provider", () => {
  test("POST /api/posts returns 503", async ({ request }) => {
    const res = await request.post("/api/posts", {
      data: { slug: "x", title: "t", content: "c" },
    });
    expect(res.status()).toBe(503);
  });

  test("/write redirects anonymous visitors away", async ({ page }) => {
    await page.goto("/write");
    await expect(page).toHaveURL(/\/$/);
  });
});
