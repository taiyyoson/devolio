import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "rehype-raw",
              message:
                "rehype-raw reintroduces a raw-HTML path into markdown rendering. The site CSP allows 'unsafe-inline' scripts, so the renderer is the only XSS control. See docs/blogging.md.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
