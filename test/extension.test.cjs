const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../extension.js'), 'utf8');
const pendingKey = 'codexRestart.pending';
const restartCommand = 'workbench.action.restartExtensionHost';

function host({ state = new Map(), execute = async () => {}, write } = {}) {
  const handlers = new Map();
  const calls = [];
  const warnings = [];
  const errors = [];
  const logs = [];
  const timers = new Set();
  const status = { show() {}, dispose() {} };
  const vscode = {
    StatusBarAlignment: { Right: 2 },
    window: {
      createOutputChannel: () => ({ appendLine: line => logs.push(line), dispose() {} }),
      createStatusBarItem: () => status,
      showWarningMessage: async message => warnings.push(message),
      showErrorMessage: async message => errors.push(message),
    },
    commands: {
      registerCommand: (id, handler) => {
        handlers.set(id, handler);
        return { dispose() {} };
      },
      executeCommand: async id => {
        calls.push(id);
        return execute(id);
      },
    },
  };
  const context = {
    subscriptions: [],
    workspaceState: {
      get: key => state.get(key),
      update: async (key, value) => {
        if (write) await write(key, value);
        if (value === undefined) state.delete(key);
        else state.set(key, value);
      },
    },
  };
  const sandbox = {
    require: id => {
      assert.equal(id, 'vscode');
      return vscode;
    },
    module: { exports: {} },
    process: { platform: 'darwin' },
    setTimeout: callback => { timers.add(callback); return callback; },
    clearTimeout: callback => timers.delete(callback),
  };
  vm.runInNewContext(source, sandbox, { filename: 'extension.js' });
  return {
    activate: () => sandbox.module.exports.activate(context),
    run: id => handlers.get(id)(),
    calls, warnings, errors, logs, timers, state, status,
  };
}

const settle = () => new Promise(resolve => setImmediate(resolve));

test('restart persists before shutdown, ignores repeated clicks, and new host opens Codex once', async () => {
  const state = new Map();
  const oldHost = host({ state, execute: async id => {
    assert.equal(id, restartCommand);
    assert.equal(typeof state.get(pendingKey), 'number');
    return new Promise(() => {}); // The old host is disposed during a real restart.
  } });
  await oldHost.activate();
  assert.deepEqual(oldHost.calls, []);
  void oldHost.run('codexRestart.restart');
  await settle();
  await oldHost.run('codexRestart.restart');
  assert.deepEqual(oldHost.calls, [restartCommand]);
  const newHost = host({ state });
  await newHost.activate();
  assert.deepEqual(newHost.calls, ['chatgpt.openSidebar']);
  assert.equal(state.has(pendingKey), false);
  const nextHost = host({ state });
  await nextHost.activate();
  assert.deepEqual(nextHost.calls, []);
});

test('failed restart clears the marker, unlocks the button and reports an error', async () => {
  const h = host({ execute: async () => { throw new Error('host unavailable'); } });
  await h.activate();
  await h.run('codexRestart.restart');
  assert.equal(h.state.has(pendingKey), false);
  assert.equal(h.errors.length, 1);
  assert.match(h.status.text, /Restart Codex/);
  await h.run('codexRestart.restart');
  assert.equal(h.calls.length, 2);
  assert.equal(h.timers.size, 0);
});

test('a vetoed or cancelled restart is not reported as success', async () => {
  const h = host();
  await h.activate();
  await h.run('codexRestart.restart');
  assert.equal(h.warnings.length, 1);
  assert.equal(h.state.has(pendingKey), false);
  assert.equal(h.timers.size, 0);
});

test('a hung restart times out and leaves the recovery shortcut in the error message', async () => {
  const h = host({ execute: () => new Promise(() => {}) });
  await h.activate();
  const pending = h.run('codexRestart.restart');
  await settle();
  for (const callback of h.timers) callback();
  await pending;
  assert.equal(h.state.has(pendingKey), false);
  assert.match(h.errors[0], /⌘⌥⇧L/);
  assert.equal(h.timers.size, 0);
});

test('failed state persistence does not initiate a restart', async () => {
  const h = host({ write: async () => { throw new Error('disk full'); } });
  await h.activate();
  await h.run('codexRestart.restart');
  assert.deepEqual(h.calls, []);
  assert.equal(h.errors.length, 1);
});

test('old, future and invalid markers are consumed without opening Codex', async () => {
  for (const marker of [Date.now() - 180000, Date.now() + 60000, 'bad', NaN, null]) {
    const h = host({ state: new Map([[pendingKey, marker]]) });
    await h.activate();
    assert.deepEqual(h.calls, []);
    assert.equal(h.state.has(pendingKey), false);
  }
});

test('missing or broken Codex cannot trigger a restart loop', async () => {
  const h = host({ state: new Map([[pendingKey, Date.now()]]), execute: async () => {
    throw new Error('command chatgpt.openSidebar not found');
  } });
  await h.activate();
  assert.deepEqual(h.calls, ['chatgpt.openSidebar']);
  assert.equal(h.state.has(pendingKey), false);
  assert.equal(h.warnings.length, 1);
  assert.equal(h.timers.size, 0);
});

test('reload recovery dispatches the built-in window reload command', async () => {
  const h = host();
  await h.activate();
  await h.run('codexRestart.reloadWindow');
  assert.deepEqual(h.calls, ['workbench.action.reloadWindow']);
});

test('emergency keybinding does not depend on this extension host executing code', () => {
  const pkg = require('../package.json');
  const emergency = pkg.contributes.keybindings.find(k => k.key === 'ctrl+alt+shift+l');
  assert.equal(emergency.command, 'workbench.action.reloadWindow');
  assert.equal(emergency.mac, 'cmd+alt+shift+l');
  assert.equal(emergency.when, undefined);
  assert.equal(pkg.extensionDependencies, undefined);
});
