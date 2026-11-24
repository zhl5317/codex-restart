const assert = require('node:assert/strict');
const vscode = require('vscode');

async function run() {
  const manifest = require('../package.json');
  const extension = vscode.extensions.getExtension(`${manifest.publisher}.${manifest.name}`);
  assert.ok(extension, 'Extension must be loaded by VS Code');
  await extension.activate();
  assert.equal(extension.isActive, true);
  const commands = await vscode.commands.getCommands(true);
  for (const id of [
    'codexRestart.restart',
    'codexRestart.reloadWindow',
    'workbench.action.restartExtensionHost',
    'workbench.action.reloadWindow',
  ]) {
    assert.ok(commands.includes(id), `${id} must be registered`);
  }
  console.log('CODEX_RESTART_SMOKE_OK');
}

module.exports = { run };
