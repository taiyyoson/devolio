import { test, expect } from "@playwright/test";
import { openTerminal } from "./helpers/terminal";

test.describe("Responsive layout", () => {
  test("desktop: terminal fills the screen", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openTerminal(page);

    const terminal = page.locator(".h-screen");
    await expect(terminal).toBeVisible();
  });

  test("mobile: shows input bar at bottom", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openTerminal(page);

    // Mobile input bar should be visible
    const mobileBar = page.locator(".sm\\:hidden");
    await expect(mobileBar).toBeVisible();
  });
});
