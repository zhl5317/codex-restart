'use strict';

const vscode = require('vscode');

const PENDING_KEY = 'codexRestart.pending';
const PENDING_TTL_MS = 2 * 60 * 1000;

function withTimeout(promise, milliseconds) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Operation timed out')), milliseconds);
    }),
  ]).finally(() => clearTimeout(timer));
}

async function activate(context) {
  const output = vscode.window.createOutputChannel('Codex Restart');
  const status = vscode.window.createStatusBarItem(
    'codexRestart.status', vscode.StatusBarAlignment.Right, 100,
  );
  const emergencyKey = process.platform === 'darwin'
    ? '⌘⌥⇧L' : 'Ctrl+Alt+Shift+L';
  let busy = false;

  function resetStatus() {
    status.text = '$(debug-restart) Restart Codex';
    status.tooltip = 'Restart all extension hosts in this window, then open Codex.\n'
      + 'Other extensions will also restart, which may interrupt running tasks.\n'
      + `If this button does not respond, press ${emergencyKey} to reload the window.`;
  }

  function log(message) {
    output.appendLine(`[${new Date().toISOString()}] ${message}`);
  }

  async function restart(command, label) {
    if (busy) return;
    busy = true;
    status.text = '$(sync~spin) Restarting Codex';
    log(`Requested: ${label}`);
    try {
      // Persist before shutdown; the new extension host consumes this once.
      await context.workspaceState.update(PENDING_KEY, Date.now());
      await withTimeout(vscode.commands.executeCommand(command), 15000);
      // A completed restart destroys this host. Returning here means it did not restart.
      log(`${label} did not complete; it may have been cancelled or blocked by another extension`);
      void vscode.window.showWarningMessage(
        `${label} did not complete. Press ${emergencyKey} to reload the window.`,
      );
    } catch (error) {
      log(`${label} failed: ${String(error)}`);
      void vscode.window.showErrorMessage(
        `${label} failed. Press ${emergencyKey} to reload the window. See Output > Codex Restart for details.`,
      );
    } finally {
      // This branch only runs if the old host survives cancellation or failure.
      try {
        await context.workspaceState.update(PENDING_KEY, undefined);
      } catch (error) {
        log(`Failed to clear the recovery marker: ${String(error)}`);
      }
      busy = false;
      resetStatus();
    }
  }

  status.name = 'Codex Restart';
  status.command = 'codexRestart.restart';
  status.accessibilityInformation = { label: 'Restart Codex and all extension hosts in this window' };
  resetStatus();
  context.subscriptions.push(
    output,
    status,
    vscode.commands.registerCommand('codexRestart.restart', () =>
      restart('workbench.action.restartExtensionHost', 'Restart extension hosts')),
    vscode.commands.registerCommand('codexRestart.reloadWindow', () =>
      restart('workbench.action.reloadWindow', 'Reload window')),
  );
  status.show();
  log('Codex Restart activated');

  const pending = context.workspaceState.get(PENDING_KEY);
  if (pending === undefined) return;
  try {
    // Clear first: failed Codex activation must never cause a restart loop.
    await context.workspaceState.update(PENDING_KEY, undefined);
    const elapsed = Date.now() - pending;
    if (typeof pending !== 'number' || !Number.isFinite(pending)
      || elapsed < 0 || elapsed > PENDING_TTL_MS) return;
    await withTimeout(vscode.commands.executeCommand('chatgpt.openSidebar'), 15000);
    log('Extension host restarted; Codex sidebar open command completed (backend health is not verified)');
  } catch (error) {
    log(`Failed to reopen Codex: ${String(error)}`);
    void vscode.window.showWarningMessage(
      'Codex Restart is running, but could not open Codex. Check that OpenAI Codex is installed and enabled. See Output > Codex Restart for details.',
    );
  }
}

module.exports = { activate };
