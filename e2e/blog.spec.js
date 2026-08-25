import { test, expect } from "@playwright/test";
import { openTerminal, runCommand } from "./helpers/terminal";

// Specs derive the post under test from the index rather than hardcoding a
// slug — posts get published and unpublished, and a fixed slug turns a routine
// `draft: true` into a red suite.
async function firstPostHref(page) {
  await page.goto("/blog");
  const links = page.locator('section#blog a[href^="/blog/"]');
  return (await links.count()) === 0 ? null : links.first().getAttribute("href");
}

test.describe("Blog", () => {
  test("index renders inside the portfolio shell", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "Writing" })).toBeVisible();
    // The rail is part of the shared layout, so it must be here too.
    await expect(page.locator("aside nav")).toBeVisible();
  });

  test("the Blogs rail item is marked active on /blog", async ({ page }) => {
    await page.goto("/blog");
    const active = page.locator('aside nav a[href="/blog"] span.bg-accent');
    await expect(active).toHaveCount(1);
  });

  test("a published post renders markdown", async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(!href, "no published posts");
    await page.goto(href);
    await expect(page.locator("article h1")).toBeVisible();
    await expect(page.locator("aside nav")).toBeVisible();
  });

  test("unknown post returns 404", async ({ page }) => {
    const res = await page.goto("/blog/does-not-exist");
    expect(res.status()).toBe(404);
  });

  test("draft posts are not listed", async ({ page }) => {
    await page.goto("/blog");
    const hrefs = await page.locator('section#blog a[href^="/blog/"]').evaluateAll((as) =>
      as.map((a) => a.getAttribute("href"))
    );
    for (const h of hrefs) {
      const res = await page.request.get(h);
      expect(res.status(), `${h} is listed so it must be reachable`).toBe(200);
    }
  });

  test("portfolio rail links to the blog", async ({ page }) => {
    await page.goto("/");
    await page.locator('aside nav a[href="/blog"]').click();
    await expect(page).toHaveURL(/\/blog$/);
  });

  test("blog index is reachable back from a post", async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(!href, "no published posts");
    await page.goto(href);
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
