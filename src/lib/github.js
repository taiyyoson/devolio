import "server-only";

const API = "https://api.github.com";

export class GitHubConfigError extends Error {}
export class GitHubApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Read config at call time, not module scope — a missing token should surface as
 * a handled 503 on the request that needs it, not crash the build.
 */
function config() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !repo) {
    throw new GitHubConfigError("GITHUB_TOKEN and GITHUB_REPO must be set");
  }
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    throw new GitHubConfigError("GITHUB_REPO must look like owner/name");
  }

  return { token, repo, branch };
}

/**
 * `allow404` is opt-in per call. As a blanket rule it silently turned a failed
 * PUT — wrong repo, token without Contents:write, missing branch — into a
 * "committed" result with a null body.
 */
async function request(path, { token, allow404 = false, ...init } = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });

  if (res.status === 404 && allow404) return null;

  if (!res.ok) {
    const body = await res.text();
    throw new GitHubApiError(
      `GitHub ${res.status}: ${body.slice(0, 200)}`,
      res.status
    );
  }

  return res.json();
}

async function getExistingSha({ token, repo, branch }, filePath) {
  const existing = await request(
    `/repos/${repo}/contents/${encodeURI(filePath)}?ref=${encodeURIComponent(branch)}`,
    { token, allow404: true }
  );
  return existing?.sha ?? null;
}

/**
 * Create or update a file on the configured branch.
 *
 * Returns { committed: true, url } — the commit triggers a deploy, so the post
 * goes live on the next build rather than immediately.
 */
export async function commitFile({ path: filePath, content, message, overwrite = false }) {
  const cfg = config();
  const sha = await getExistingSha(cfg, filePath);

  if (sha && !overwrite) {
    throw new GitHubApiError(`File already exists: ${filePath}`, 409);
  }

  const result = await request(`/repos/${cfg.repo}/contents/${encodeURI(filePath)}`, {
    token: cfg.token,
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      branch: cfg.branch,
      ...(sha ? { sha } : {}),
    }),
  });

  return { committed: true, url: result?.content?.html_url ?? null };
}

export function isGitHubConfigured() {
  try {
    config();
    return true;
  } catch {
    return false;
  }
}
