# Codex Restart

English | [简体中文](README.zh-CN.md)

**Codex frozen or not responding in VS Code? Keep a restart button within reach.**

[Install from the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=zhouhl.codex-restart) · [Report a problem](https://github.com/zhl5317/codex-restart/issues) · [Source code](https://github.com/zhl5317/codex-restart)

Codex Restart adds a status bar button, a Codex sidebar action, and an emergency reload shortcut. Click once to restart the current window's extension hosts and reopen the Codex sidebar.

**Other extensions in the same window restart too. Running extension tasks may be interrupted.** This is an independent tool by zhouhl, not an official OpenAI product.

## Install in seconds

1. Open [Codex Restart on the Marketplace](https://marketplace.visualstudio.com/items?itemName=zhouhl.codex-restart) and choose **Install**.
2. Return to VS Code and find **Restart Codex** in the status bar.
3. When Codex gets stuck, click the button or use the shortcut below.

You can also paste this into VS Code Quick Open (`Ctrl+P` / `Cmd+P`):

```text
ext install zhouhl.codex-restart
```

Requires **VS Code 1.96.0+** and **Codex - OpenAI's coding agent** (`openai.chatgpt`) installed and enabled. If the button does not appear after installation, run **Developer: Reload Window**.

## Two recovery options

| Action | Use it when | What happens |
| --- | --- | --- |
| **Restart Codex** | The Codex panel is stuck and VS Code still responds | Restarts extension hosts in the current window, then opens the Codex sidebar once |
| **Emergency Reload** | The restart button or extension code cannot respond | Calls VS Code's built-in window reload command directly |

| Shortcut | macOS | Windows / Linux |
| --- | --- | --- |
| Restart Codex | `Cmd+Option+Shift+R` | `Ctrl+Alt+Shift+R` |
| Emergency Reload | `Cmd+Option+Shift+L` | `Ctrl+Alt+Shift+L` |

The restart action is also available in the Codex sidebar title. Search for **Codex Restart** in the Command Palette to find both commands. Change shortcuts in VS Code's Keyboard Shortcuts editor if they conflict with your setup.

The emergency shortcut does not depend on this extension's JavaScript. After a reload, open the Codex sidebar manually if necessary. If the entire VS Code window is frozen, quit and reopen VS Code.

## Why this extension?

VS Code already provides **Restart Extension Host** and **Reload Window**. This extension puts those actions next to Codex and adds a one-time request to reopen its sidebar after a restart. It has no runtime dependencies and does not send telemetry or make its own network requests.

It does not modify Codex installation files, accounts, conversation history, or configuration. It does not clear caches or kill processes by name.

## Scope and limitations

- **It cannot restart only Codex.** VS Code's public Extension API does not provide a method to deactivate or restart another individual extension. The inspected Codex version, `26.51117.41037`, does not contribute a standalone restart command.
- **Save your work before reloading.** Host restarts can interrupt active Codex work and other extension tasks; reloading affects the whole current window.
- **Remote windows may restart remote hosts too.** VS Code manages which extension hosts are restarted in SSH, WSL, and Dev Container windows.
- **Reopening is not a health check.** The extension asks VS Code to open the sidebar; it cannot guarantee that Codex's backend is healthy or that an active task will resume.
- **It does not fix the root cause of a crash.** Network, authentication, service, installation, and remote connection problems may require separate troubleshooting.
- **There is no automatic restart loop.** Recovery markers are consumed once and expire after two minutes.

## Troubleshooting and feedback

Open **View > Output** and select **Codex Restart** for recovery messages. The output channel is recreated when its extension host restarts.

If restarting does not help, try the emergency reload shortcut, then check that `openai.chatgpt` is installed and enabled. For persistent failures, inspect Codex's own logs and connection status.

[Open an issue](https://github.com/zhl5317/codex-restart/issues/new?template=bug_report.md) with your operating system, VS Code version, Codex version, local/remote setup, and what happened after the restart. Remove private prompts, tokens, and file paths from any logs you share.

## Development

Use Node.js 20 or later:

```sh
npm ci
npm test
npm run package
```

Open this directory in VS Code and press **F5** to launch an Extension Development Host. `test/smoke.cjs` can be passed as `--extensionTestsPath` to check activation and command registration in a real VS Code host.

Validation: nine automated tests pass. On macOS arm64 with VS Code 1.147.0, activation and command registration were checked in a real extension host. An isolated test window successfully restarted its host and reloaded its window, with changed process IDs and successful sidebar command calls. That test used a Codex command fixture; it did not reproduce a real Codex crash. Windows, Linux, and remote windows have not been tested.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and issue-reporting guidance.

## Author and license

**zhouhl** · [zhl809041737@gmail.com](mailto:zhl809041737@gmail.com) · [Homepage](https://github.com/zhl5317?tab=repositories)

MIT licensed. See [LICENSE](LICENSE).
