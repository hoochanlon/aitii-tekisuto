# 文章内容加密功能

本文档说明如何在 MkDocs 项目中使用文章内容加密功能。

## 功能概述

该加密功能基于 `content.config.ts`、`encrypt.ts`、`Encrypt.astro`、`PasswordWrapper.astro` 的逻辑实现，为 MkDocs 项目提供了类似的文章内容加密能力。

## 技术实现

- **加密算法**: AES-CBC 256 位
- **加密时机**: 构建时（通过 MkDocs hook）
- **解密时机**: 客户端（浏览器中）
- **密码存储**: localStorage（24小时有效）

## 文件结构

```
├── tools/
│   └── encrypt.py                    # Python 加密工具（构建时使用）
├── material/overrides/
│   ├── hooks/
│   │   └── encrypt.py               # MkDocs hook（处理 Markdown 加密标记）
│   └── assets/
│       ├── javascripts/
│       │   └── encrypt.js           # 客户端解密脚本
│       └── stylesheets/
│           └── encrypt.css          # 加密组件样式
└── docs/
    └── encrypt-example.md           # 使用示例文档
```

## 使用方法

### 1. 安装依赖

确保已安装 `cryptography` 库：

```bash
pip install -r requirements.txt
```

### 2. 在 Markdown 中使用

在 Markdown 文件的 front-matter 中添加 `password` 字段，整个页面内容会自动加密：

```markdown
---
password: your-password
---

这里是要加密的内容。

可以包含：
- **Markdown 格式**
- 代码块
- 列表
- 等等...

```python
def example():
    print("加密的代码")
```
```

### 3. 语法说明

- 在 front-matter 中添加 `password` 字段指定密码
- 整个页面内容会自动加密，无需额外的加密标记
- 访问页面时，需要输入密码才能查看内容

**优势**：
- ✅ 密码不会出现在正文中，更安全
- ✅ 符合 MkDocs 的标准做法
- ✅ 使用简单，只需在 front-matter 添加密码即可
- ✅ 便于管理和维护

### 4. 构建和预览

正常构建 MkDocs 项目：

```bash
mkdocs build
mkdocs serve
```

加密内容会在构建时自动处理。

## 特性

✅ **安全性**
- AES-CBC 256 位加密
- 每次加密使用随机 IV
- 密码不会出现在源代码中

✅ **用户体验**
- 自动保存密码（24小时有效）
- 支持回车键确认
- 错误提示友好
- 适配暗色模式

✅ **兼容性**
- 支持 MkDocs Material 主题
- 支持即时导航（instant navigation）
- 支持多个加密块在同一页面

## 注意事项

1. **密码安全**: 使用足够复杂的密码，避免使用简单密码
2. **密码区分大小写**: 密码是区分大小写的
3. **密码存储**: 密码会保存在浏览器的 localStorage 中，24小时后自动过期
4. **构建要求**: 确保 Python 环境中有 `cryptography` 库
5. **多个加密块**: 同一页面可以有多个加密块，每个使用不同的密码

## 与原始实现的对应关系

| 原始文件 | MkDocs 实现 | 说明 |
|---------|------------|------|
| `encrypt.ts` | `tools/encrypt.py` | 加密函数（构建时） |
| `Encrypt.astro` | `material/overrides/hooks/encrypt.py` | 处理加密标记 |
| `Encrypt.astro` (script) | `material/overrides/assets/javascripts/encrypt.js` | 客户端解密 |
| `PasswordWrapper.astro` | Hook 自动处理 | 条件加密逻辑 |
| `content.config.ts` | MkDocs front-matter | 使用 `password` 字段指定密码 |

## 故障排除

### 加密失败

如果构建时出现加密错误，检查：
1. `cryptography` 库是否已安装
2. Python 版本是否兼容（建议 Python 3.8+）
3. `tools/encrypt.py` 文件是否存在且可执行

### 解密失败

如果客户端无法解密，检查：
1. 浏览器控制台是否有错误
2. 密码是否正确（区分大小写）
3. JavaScript 文件是否正确加载

### 样式问题

如果样式显示异常，检查：
1. `encrypt.css` 是否正确加载
2. MkDocs Material 主题版本是否兼容

## 示例

查看 `docs/encrypt-example.md` 获取完整的使用示例。
