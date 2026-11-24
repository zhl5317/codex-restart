# Contributing

Start with an issue that explains the problem you want to solve. For a bug, include your OS, VS Code version, Codex version, whether you use a remote workspace, and the action you tried. Please remove credentials, private prompts, and sensitive paths before sharing logs.

## Run locally

Use Node.js 20 or later, run `npm ci`, then `npm test`. Open this folder in VS Code and press F5 to launch a separate Extension Development Host. Use an isolated workspace for restart tests: these commands can interrupt other extensions in the same window.

## Before submitting a change

- Keep the extension free of runtime dependencies unless a dependency is necessary.
- Explain the user-visible behavior and relevant limitations.
- Run `npm test` and `npm run package`.
- Add focused coverage when recovery behavior changes. Documentation-only changes do not need new tests.
