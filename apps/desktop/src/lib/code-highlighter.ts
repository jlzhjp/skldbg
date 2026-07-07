import type { CodeHighlighterPlugin, HighlightOptions, ThemeInput } from "streamdown";

const themes = ["github-light", "github-dark"] satisfies [ThemeInput, ThemeInput];

const supportedLanguages = [
  "bash",
  "css",
  "diff",
  "dockerfile",
  "html",
  "javascript",
  "json",
  "jsx",
  "markdown",
  "python",
  "sql",
  "tsx",
  "typescript",
  "yaml",
] as const;

type SupportedLanguage = (typeof supportedLanguages)[number];
type HighlightCallback = NonNullable<Parameters<CodeHighlighterPlugin["highlight"]>[1]>;
type HighlightResult = Parameters<HighlightCallback>[0];

const plainTextLanguages = new Set([
  "",
  "nohighlight",
  "none",
  "plain",
  "plaintext",
  "text",
  "txt",
]);

const languageAliases = {
  bash: "bash",
  css: "css",
  diff: "diff",
  docker: "dockerfile",
  dockerfile: "dockerfile",
  html: "html",
  js: "javascript",
  javascript: "javascript",
  json: "json",
  jsonc: "json",
  jsx: "jsx",
  markdown: "markdown",
  md: "markdown",
  py: "python",
  python: "python",
  sh: "bash",
  shell: "bash",
  shellscript: "bash",
  sql: "sql",
  ts: "typescript",
  tsx: "tsx",
  typescript: "typescript",
  yaml: "yaml",
  yml: "yaml",
  zsh: "bash",
} satisfies Record<string, SupportedLanguage>;

const languageAliasMap: Readonly<Record<string, SupportedLanguage>> = languageAliases;
const supportedLanguageSet = new Set(Object.keys(languageAliases));
const highlightCache = new Map<string, HighlightResult>();
const pendingCallbacks = new Map<string, Set<(result: HighlightResult) => void>>();

const getThemeName = (theme: ThemeInput) => (typeof theme === "string" ? theme : theme.name);

const getCacheKey = (options: HighlightOptions, language: SupportedLanguage) => {
  const [lightTheme, darkTheme] = options.themes.map(getThemeName);
  const head = options.code.slice(0, 100);
  const tail = options.code.length > 100 ? options.code.slice(-100) : "";
  return `${language}:${lightTheme}:${darkTheme}:${options.code.length}:${head}:${tail}`;
};

const createPlainTextResult = (code: string): HighlightResult => ({
  bg: "transparent",
  fg: "inherit",
  tokens: code.split("\n").map((line) => [
    {
      content: line,
      color: "inherit",
      bgColor: "transparent",
      htmlStyle: {},
      offset: 0,
    },
  ]),
});

const normalizeLanguage = (language: string | null | undefined): SupportedLanguage | null => {
  const normalized = language?.trim().toLowerCase() ?? "";
  return languageAliasMap[normalized] ?? null;
};

const highlighterPromise = Promise.all([
  import("shiki/core"),
  import("shiki/engine/javascript"),
  import("shiki/themes/github-light.mjs"),
  import("shiki/themes/github-dark.mjs"),
  import("shiki/langs/bash.mjs"),
  import("shiki/langs/css.mjs"),
  import("shiki/langs/diff.mjs"),
  import("shiki/langs/dockerfile.mjs"),
  import("shiki/langs/html.mjs"),
  import("shiki/langs/javascript.mjs"),
  import("shiki/langs/json.mjs"),
  import("shiki/langs/jsx.mjs"),
  import("shiki/langs/markdown.mjs"),
  import("shiki/langs/python.mjs"),
  import("shiki/langs/sql.mjs"),
  import("shiki/langs/tsx.mjs"),
  import("shiki/langs/typescript.mjs"),
  import("shiki/langs/yaml.mjs"),
]).then(
  ([
    { createHighlighterCore },
    { createJavaScriptRegexEngine },
    githubLight,
    githubDark,
    bash,
    css,
    diff,
    dockerfile,
    html,
    javascript,
    json,
    jsx,
    markdown,
    python,
    sql,
    tsx,
    typescript,
    yaml,
  ]) =>
    createHighlighterCore({
      engine: createJavaScriptRegexEngine({ forgiving: true }),
      langs: [
        bash.default,
        css.default,
        diff.default,
        dockerfile.default,
        html.default,
        javascript.default,
        json.default,
        jsx.default,
        markdown.default,
        python.default,
        sql.default,
        tsx.default,
        typescript.default,
        yaml.default,
      ],
      themes: [githubLight.default, githubDark.default],
    }),
);

export const codeHighlighter: CodeHighlighterPlugin = {
  name: "shiki",
  type: "code-highlighter",
  getSupportedLanguages: () => [...supportedLanguages],
  getThemes: () => themes,
  supportsLanguage: (language) =>
    plainTextLanguages.has(language?.trim().toLowerCase() ?? "") ||
    supportedLanguageSet.has(language),
  highlight: (options, callback) => {
    const normalizedLanguage = options.language?.trim().toLowerCase() ?? "";
    if (plainTextLanguages.has(normalizedLanguage)) {
      return createPlainTextResult(options.code);
    }

    const language = normalizeLanguage(options.language);
    if (!language) {
      return createPlainTextResult(options.code);
    }

    const cacheKey = getCacheKey(options, language);
    const cached = highlightCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (callback) {
      const callbacks = pendingCallbacks.get(cacheKey) ?? new Set();
      callbacks.add(callback);
      pendingCallbacks.set(cacheKey, callbacks);
    }

    void highlighterPromise
      .then((highlighter) => {
        const [lightTheme, darkTheme] = options.themes.map(getThemeName);
        const result = highlighter.codeToTokens(options.code, {
          lang: language,
          themes: {
            light: lightTheme,
            dark: darkTheme,
          },
        });

        highlightCache.set(cacheKey, result);
        const callbacks = pendingCallbacks.get(cacheKey);
        if (callbacks) {
          for (const onResult of callbacks) {
            onResult(result);
          }
          pendingCallbacks.delete(cacheKey);
        }
      })
      .catch((error: unknown) => {
        console.error("[Skill Debugger] Failed to highlight code:", error);
        pendingCallbacks.delete(cacheKey);
      });

    return null;
  },
};
