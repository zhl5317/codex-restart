# Codex Restart

[English](README.md) | 简体中文

**Codex 在 VS Code 中卡住、没有响应？把重启入口放在随手可用的位置。**

[从 VS Code 插件市场安装](https://marketplace.visualstudio.com/items?itemName=zhouhl.codex-restart) · [反馈问题](https://github.com/zhl5317/codex-restart/issues) · [项目源码](https://github.com/zhl5317/codex-restart)

Codex Restart 提供状态栏按钮、Codex 侧边栏操作入口和应急重载快捷键。点击后，会重启当前窗口的扩展宿主，并尝试重新打开 Codex 侧边栏。

**同一窗口中的其他扩展也会重启，正在运行的插件任务可能中断。** 本扩展由 zhouhl 独立开发，并非 OpenAI 官方产品。

## 安装

1. 打开 [Codex Restart 市场页面](https://marketplace.visualstudio.com/items?itemName=zhouhl.codex-restart)，点击 **Install**。
2. 回到 VS Code，在状态栏找到 **Restart Codex**。
3. Codex 卡住时点击按钮，或使用下方快捷键。

也可以在 VS Code 的快速打开窗口（`Ctrl+P` / `Cmd+P`）中输入：

```text
ext install zhouhl.codex-restart
```

需要 **VS Code 1.96.0 或更高版本**，并安装、启用官方 **Codex - OpenAI's coding agent** 扩展（`openai.chatgpt`）。安装后若按钮未出现，可执行 **Developer: Reload Window / 开发人员: 重新加载窗口**。

## 两种恢复方式

| 操作 | 适用情况 | 实际行为 |
| --- | --- | --- |
| **Restart Codex** | Codex 面板卡住，但 VS Code 仍有响应 | 重启当前窗口的扩展宿主，再尝试打开一次 Codex 侧边栏 |
| **Emergency Reload** | 重启按钮或扩展代码已经无法响应 | 直接执行 VS Code 内置的重新加载窗口命令 |

| 快捷键 | macOS | Windows / Linux |
| --- | --- | --- |
| 重启 Codex | `Cmd+Option+Shift+R` | `Ctrl+Alt+Shift+R` |
| 应急重载窗口 | `Cmd+Option+Shift+L` | `Ctrl+Alt+Shift+L` |

Codex 侧边栏标题处也提供重启按钮。在命令面板搜索 **Codex Restart** 可以找到两个命令。如与其他快捷键冲突，可在 VS Code 的键盘快捷方式设置中修改。

应急快捷键直接绑定 VS Code 内置命令，不需要本扩展的 JavaScript 正常运行。重载后如果 Codex 侧边栏没有显示，请手动打开。若整个 VS Code 窗口已经卡死，仍需退出并重新启动 VS Code。

## 它解决什么问题？

VS Code 已提供 **Restart Extension Host（重启扩展宿主）** 和 **Reload Window（重新加载窗口）**。本扩展把这些恢复操作放到 Codex 附近，并在重启后增加一次重新打开侧边栏的请求。

扩展没有运行时依赖，不发送遥测，也不自行发起网络请求。它不修改 Codex 的安装文件、账号、聊天记录或配置，不清理缓存，也不按名称批量结束进程。

## 范围与限制

- **无法只重启 Codex。** VS Code 的公开扩展 API 没有单独停用或重启另一个扩展的方法。检查过的 Codex `26.51117.41037` 也没有提供独立重启命令。
- **重载前请保存工作。** 重启宿主可能中断当前的 Codex 任务及其他插件任务；重新加载窗口会影响整个当前窗口。
- **远程窗口也可能重启远端宿主。** SSH、WSL、Dev Container 中的具体重启范围由 VS Code 管理。
- **打开面板不代表后端恢复。** 扩展只请求打开侧边栏，无法保证 Codex 后端健康或原任务自动恢复。
- **不会修复崩溃根因。** 网络、登录、服务、安装和远程连接问题仍可能需要单独排查。
- **不会自动循环重启。** 恢复标记只消费一次，并在两分钟后失效。

## 排查与反馈

在 **查看 → 输出** 中选择 **Codex Restart** 查看恢复日志。输出通道会随着扩展宿主重启而重建。

如果重启无效，先尝试应急重载快捷键，再检查 `openai.chatgpt` 是否已安装、启用。持续失败时，请查看 Codex 自身的日志和连接状态。

[提交问题反馈](https://github.com/zhl5317/codex-restart/issues/new?template=bug_report.md)时，请说明操作系统、VS Code 和 Codex 版本、本地或远程环境，以及点击后的实际结果。分享日志前，请删除私人提示词、令牌和敏感文件路径。

## 开发

使用 Node.js 20 或更高版本：

```sh
npm ci
npm test
npm run package
```

在 VS Code 打开本目录并按 **F5**，可启动独立的扩展开发窗口。`test/smoke.cjs` 可用作 `--extensionTestsPath`，检查真实扩展宿主中的激活和命令注册。

验证情况：9 项自动化测试通过。在 macOS arm64、VS Code 1.147.0 上验证了激活与命令注册；独立测试窗口中实际执行了宿主重启和窗口重载，确认宿主进程变化、侧边栏命令被调用。完整流程测试使用 Codex 命令替身，没有复现真实的 Codex 崩溃。Windows、Linux 和远程窗口尚未实测。

贡献说明见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 作者与许可

**zhouhl** · [zhl809041737@gmail.com](mailto:zhl809041737@gmail.com) · [主页](https://github.com/zhl5317?tab=repositories)

采用 MIT 许可证，详见 [LICENSE](LICENSE)。
