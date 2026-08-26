import { test, expect } from "@playwright/test";
import projects from "../src/data/projects.json" with { type: "json" };

test.describe("Projects index", () => {
  test("lists every project as a card linking to its detail page", async ({ page }) => {
    await page.goto("/projects");

    const cards = page.locator('section#projects a[href^="/projects/"]');
    await expect(cards).toHaveCount(projects.length);

    for (const project of projects) {
      await expect(
        page.locator(`section#projects a[href="/projects/${project.slug}"]`)
      ).toHaveCount(1);
    }
  });

  test("does not link straight out to GitHub from the index", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator('section#projects a[href*="github.com"]')).toHaveCount(0);
  });

  test("clicking a card opens the case study", async ({ page }) => {
    await page.goto("/projects");
    await page.locator('a[href="/projects/nala"]').click();
    await page.waitForURL("**/projects/nala");
    await expect(page.locator("h1")).toHaveText("Nala");
  });
});

test.describe("Project detail", () => {
  test("every project slug resolves", async ({ page }) => {
    for (const project of projects) {
      const res = await page.goto(`/projects/${project.slug}`);
      expect(res.status(), `${project.slug} did not return 200`).toBe(200);
      await expect(page.locator("h1")).toHaveText(project.title);
    }
  });

  test("shows the GitHub link and the back link", async ({ page }) => {
    await page.goto("/projects/nala");
    await expect(page.locator('article a[href*="github.com/taiyyoson/nala"]')).toBeVisible();
    await expect(page.locator('article a[href="/projects"]')).toBeVisible();
  });

  test("renders the case-study sections", async ({ page }) => {
    await page.goto("/projects/nala");
    const text = await page.textContent("body");
    expect(text).toContain("Problem");
    expect(text).toContain("Solution");
    expect(text).toContain("Impact");
    expect(text).toContain("My role");
  });

  test("renders a mermaid diagram as inline SVG", async ({ page }) => {
    await page.goto("/projects/roblox-studio-mcp");
    await expect(page.locator('div[role="img"] svg')).toBeVisible();
  });

  test("an unknown slug 404s", async ({ page }) => {
    const res = await page.goto("/projects/not-a-real-project");
    expect(res.status()).toBe(404);
  });

  test("the rail still marks Projects active on a detail page", async ({ page }) => {
    await page.goto("/projects/nala");
    await expect(page.locator('aside nav a[href="/projects"] span.bg-accent')).toHaveCount(1);
  });
});
