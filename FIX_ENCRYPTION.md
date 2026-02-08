# 加密/解密修复说明

## 已修复的问题

### 1. Windows 命令行长度限制导致内容被截断
- **原因**：通过 `subprocess` 把整段 HTML 作为命令行参数传给 `tools/encrypt.py` 时，在 Windows 上会受约 8191 字符限制，长文被截断后加密数据不完整，解密时出现长度不匹配（如 4297 vs 4304）。
- **修复**：
  - `tools/encrypt.py` 支持从 **stdin** 读取待加密内容：`python encrypt.py <password>`，从 stdin 读数据。
  - `material/overrides/hooks/encrypt.py` 改为通过 `input=html` 把内容传给子进程，不再用 argv 传大段 HTML。

### 2. HTML 中的非法 Unicode（surrogate）导致加密崩溃
- **原因**：MkDocs 输出的 HTML 中可能包含非法代理对（如 `\udc80`），`data.encode('utf-8')` 会抛出 `UnicodeEncodeError`。
- **修复**：在 `tools/encrypt.py` 中使用 `data.encode('utf-8', errors='replace')`，对非法字符做替换，避免构建失败。

### 3. 前端解密与调试逻辑
- **修复**：
  - 删除 `encrypt.js` 中重复的 `setItemWithExpire` / `getItemWithExpire` 定义。
  - 精简解密流程中的 `console.log`，统一错误提示为「密码错误」或「解密失败」。
  - 本地缓存 key 改为 `encrypt:` + 页面路径，不再依赖 `data-password`，避免与后端字段强绑定。
  - `getItemWithExpire` 增加 try/catch，避免 `JSON.parse` 异常导致脚本报错。

## 验证步骤

1. **清理并重新构建**：
   ```powershell
   Remove-Item -Recurse -Force site -ErrorAction SilentlyContinue
   python -m mkdocs build
   ```

2. **本地预览**：
   ```powershell
   python -m mkdocs serve
   ```
   打开「一、利用“永恒之蓝”漏洞…」页面，输入密码 `demo123`，应能正常解密并显示内容。

3. **命令行验证加解密**（可选）：
   ```powershell
   "test content" | python tools/encrypt.py demo123
   # 将输出的 Base64 复制，然后：
   python tools/decrypt.py "<Base64>" demo123
   ```

## 全面排查「密码错误」

当页面提示「密码错误」时，按下面顺序排查。

### 1. 确认 Python 能解密当前 JSON

构建后，用**当前构建**生成的 JSON 和密码在本地跑一次解密（把 `0a32c8e7` 换成你 Network 里看到的文件名）：

```powershell
python tools/verify_payload.py site/assets/encrypted/0a32c8e7.json demo123
```

- **输出 `[VERIFY] OK`**：说明密文和密码在 Python 端一致，问题在**浏览器端**（密钥推导或解密逻辑）。
- **输出 `[VERIFY] FAIL`**：说明密文或密码在构建/写入时就不对，需检查 front-matter 的 `password` 和 hook 的密码清洗。

### 2. 看控制台是否报「密钥与构建时不一致」

构建时会在 payload JSON 里写入 `keyHex`（密钥前 8 字节 hex）。前端解密前会用当前输入的密码推导密钥，和 `keyHex` 比对。

- **控制台出现**：`[ENCRYPT] 密钥与构建时不一致。构建(前8字节): xxx 当前(前8字节): yyy`  
  → 说明**当前输入的密码**和**构建时用的密码**推导出的密钥不同（多空格、换行、BOM 等）。  
  → 解决：保证 front-matter 里 `password: demo123` 无多余空格/换行；输入时不要复制到多余字符；或直接使用页面上 `data-password` 里的值（已支持用其重试一次）。

- **没有这条日志**：说明密钥一致，问题在 IV/密文或 Web Crypto 行为，需继续看下一步。

### 3. 确保用最新构建且无缓存

- 删掉 `site` 后重新构建：`Remove-Item -Recurse -Force site; python -m mkdocs build`
- 浏览器**硬刷新**该页（Ctrl+Shift+R），再输入密码。  
- payload URL 已带 `?v=<hash>`，一般不会用到旧 JSON；若仍怀疑缓存，可在 Network 里看该 JSON 请求是否 200 且内容完整。

### 4. 小结

| 现象 | 可能原因 | 建议 |
|------|----------|------|
| verify_payload.py FAIL | 密文或密码在构建时就不对 | 检查 front-matter、hook 密码清洗、encrypt 子进程 |
| 控制台「密钥与构建时不一致」 | 当前密码与构建时密码不一致 | 统一密码（无空格/换行），或使用 data-password 重试 |
| verify_payload OK 且无密钥不一致，仍「密码错误」 | IV/密文或 Web Crypto 行为 | 检查 Base64 是否完整、解密参数是否与 Python 一致 |

## 使用说明

- 在需要加密的页面 front-matter 中设置 `password: 你的密码`，构建时该页正文会被加密。
- 密码区分大小写；解密成功后会在当前页面路径下缓存 24 小时（localStorage）。
