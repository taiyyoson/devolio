import { test, expect } from "@playwright/test";
import { openTerminal, runCommand } from "./helpers/terminal";

// CI has no GitHub OAuth credentials, so every flow below lands on the
// "not configured" path. That is deliberate: it exercises the whole
// command -> redirect -> callback -> hash -> terminal contract without ever
// touching github.com.

test.describe("Auth endpoints", () => {
  test("/api/auth/me reports logged out for anonymous visitors", async ({ request }) => {
    const res = await request.get("/api/auth/me");
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ authenticated: false, login: null });
  });

  // Configured (local) -> GitHub's authorize screen with a state param.
  // Unconfigured (CI)  -> straight back to the terminal. Both are correct.
  test("/api/auth/login either reaches GitHub or reports not configured", async ({ request }) => {
    const res = await request.get("/api/auth/login", { maxRedirects: 0 });
    expect(res.status()).toBe(303);

    const location = res.headers()["location"];
    if (location.includes("github.com")) {
      const url = new URL(location);
      expect(url.pathname).toBe("/login/oauth/authorize");
      expect(url.searchParams.get("state")).toBeTruthy();
      expect(url.searchParams.get("client_id")).toBeTruthy();
      // Identity only — a scoped token would blur the line with GITHUB_TOKEN.
      expect(url.searchParams.get("scope")).toBe("");
      // Omitted so GitHub uses the registered callback rather than anything
      // derived from the request's Host header.
      expect(url.searchParams.get("redirect_uri")).toBeNull();
    } else {
      expect(location).toContain("#login=not_configured");
    }
  });

  test("/api/auth/login sets a state cookie when configured", async ({ request }) => {
    const res = await request.get("/api/auth/login", { maxRedirects: 0 });
    const cookie = res.headers()["set-cookie"] ?? "";
    if (res.headers()["location"].includes("github.com")) {
      expect(cookie).toContain("devolio_oauth_state=");
      expect(cookie).toContain("HttpOnly");
      // "Lax", never "Strict": Strict would drop the cookie on the return leg
      // from github.com and login would fail every time.
      expect(cookie).toContain("SameSite=lax");
    }
  });

  test("callback rejects a request with no state cookie", async ({ page }) => {
    await page.goto("/api/auth/callback?code=abc&state=xyz");
    await expect(page).toHaveURL(/#login=(state_missing|not_configured)$/);
  });

  test("callback treats a denied consent screen as a cancellation", async ({ page }) => {
    await page.goto("/api/auth/callback?error=access_denied");
    await expect(page).toHaveURL(/#login=(denied|not_configured)$/);
  });

  test("logout is not reachable by GET", async ({ request }) => {
    const res = await request.get("/api/auth/logout");
    expect(res.status()).toBe(405);
  });
});

test.describe("Boot hash opens the terminal", () => {
  test("#login=ok lands in the terminal, not the portfolio", async ({ page }) => {
    await page.goto("/#login=ok");
    await expect(page.locator("input").first()).toBeVisible();
    await expect(page.locator("body")).toContainText("Login complete");
  });

  test("#login=forbidden shows the rejection", async ({ page }) => {
    await page.goto("/#login=forbidden");
    await expect(page.locator("body")).toContainText("not the owner");
  });

  test("an unknown boot code shows no message", async ({ page }) => {
    await page.goto("/#login=bogus");
    await expect(page.locator("input").first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Login complete");
  });

  test("no hash still lands on the portfolio", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Blogs" })).toBeVisible();
  });
});

test.describe("Terminal auth commands", () => {
  test.beforeEach(async ({ page }) => {
    await openTerminal(page);
  });

  test("/login and /logout are listed in help", async ({ page }) => {
    await runCommand(page, "help");
    const text = await page.textContent("body");
    expect(text).toContain("/login");
    expect(text).toContain("/logout");
  });

  test("/logout reports not authenticated when logged out", async ({ page }) => {
    await runCommand(page, "/logout");
    await expect(page.locator("body")).toContainText("Not authenticated");
  });

  test("/kanban denies access when not authenticated", async ({ page }) => {
    await runCommand(page, "/kanban");
    const text = await page.textContent("body");
    expect(text).toContain("Access denied");
  });

  test("/write denies access when not authenticated", async ({ page }) => {
    await runCommand(page, "/write");
    await expect(page.locator("body")).toContainText("Access denied");
  });
});

test.describe("Publishing stays gated", () => {
  test("POST /api/posts is rejected without a session", async ({ request }) => {
    const res = await request.post("/api/posts", {
      data: { slug: "x", title: "t", content: "c" },
    });
    expect([401, 503]).toContain(res.status());
  });

  test("/write redirects anonymous visitors away", async ({ page }) => {
    await page.goto("/write");
    await expect(page).toHaveURL(/\/$/);
  });

  test("the portfolio exposes no login affordance", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /log ?in/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /log ?in/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /write/i })).toHaveCount(0);
  });
});
