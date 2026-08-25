import { test, expect } from "@playwright/test";
import { openTerminal, runCommand } from "./helpers/terminal";

test.describe("Blog", () => {
  test("index lists published posts", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "WRITING" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Hello, world" })).toBeVisible();
  });

  test("post page renders markdown", async ({ page }) => {
    await page.goto("/blog/hello-world");
    await expect(page.getByRole("heading", { name: "Hello, world" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Frontmatter" })).toBeVisible();
    // remark-gfm: the table in the post body
    await expect(page.locator("article table")).toBeVisible();
  });

  test("unknown post returns 404", async ({ page }) => {
    const res = await page.goto("/blog/does-not-exist");
    expect(res.status()).toBe(404);
  });

  test("portfolio rail links to the blog", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Blogs" }).click();
    await expect(page).toHaveURL(/\/blog$/);
  });

  test("blog index is reachable back from a post", async ({ page }) => {
    await page.goto("/blog/hello-world");
    await page.getByRole("link", { name: "← writing" }).click();
    await expect(page).toHaveURL(/\/blog$/);
  });
});

test.describe("Publishing is gated", () => {
  test("POST /api/posts rejects unauthenticated callers", async ({ request }) => {
    const res = await request.post("/api/posts", {
      data: { slug: "x", title: "x", content: "x" },
    });
    expect([401, 503]).toContain(res.status());
    expect(await res.text()).not.toContain("committed");
  });

  test("/write redirects anonymous visitors away", async ({ page }) => {
    await page.goto("/write");
    await expect(page).toHaveURL(/\/$/);
  });

  test("/write command denies access when logged out", async ({ page }) => {
    await openTerminal(page);
    await runCommand(page, "/write");
    const text = await page.textContent("body");
    expect(text).toContain("Access denied");
  });
});
