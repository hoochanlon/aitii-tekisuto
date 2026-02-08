# 《AD域控与数据通信网络》

AD 域控与数据通信网络的统一技术文档平台，覆盖架构设计、部署实施、安全加固与日常运维，帮助你快速搭建与维护稳定可靠的企业网络环境。

## 项目简介

本项目使用 [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) 构建，提供现代化的文档站点体验。项目集成了文章内容加密功能和流畅的页面过渡动画，为敏感文档提供安全保护，同时优化了用户的浏览体验。

## 核心特性

### 文章内容加密

- **AES-CBC 256 位加密**：采用行业标准加密算法，确保内容安全
- **构建时加密**：内容在构建时加密，密码不会出现在源代码中
- **客户端解密**：支持浏览器端实时解密，无需服务器端处理
- **自动密码保存**：密码自动保存到 localStorage，24 小时有效
- **简单易用**：只需在 Markdown front-matter 中添加 `password` 字段即可

### 页面过渡动画

- **流畅淡入效果**：页面加载时内容平滑淡入，减少视觉突兀
- **页面切换优化**：点击链接或刷新时，旧内容先淡出，新内容再淡入
- **内容高度稳定**：针对内容较短的页面，设置最小高度，避免布局跳动
- **列表项依次显示**：列表项依次淡入，提升视觉体验
- **性能优化**：使用 CSS transition 和 will-change 优化动画性能

## 一键启动

> **注意**：在 PowerShell 7+ 中也可以使用 `&&` 连接符：
> ```powershell
> python -m pip install -r requirements.txt && python -m mkdocs serve
> ```

```powershell
python -m pip install -r requirements.txt; if ($?) { python -m mkdocs serve }
```

或者分步执行：

```powershell
python -m pip install -r requirements.txt
python -m mkdocs serve
```


启动成功后，在浏览器中访问：http://127.0.0.1:8000


## 使用文章加密功能

### 基本用法

在 Markdown 文件的 front-matter 中添加 `password` 字段，整个页面内容会自动加密：

````markdown
---

password: your-password
password-hint: desc

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
````

### 特性说明

- ✅ **安全性**：AES-CBC 256 位加密，每次加密使用随机 IV
- ✅ **用户体验**：自动保存密码（24小时有效），支持回车键确认
- ✅ **兼容性**：支持 MkDocs Material 主题和即时导航
- ✅ **暗色模式**：完美适配暗色主题

### 详细文档

更多关于加密功能的使用说明，请查看 [ENCRYPT_README.md](ENCRYPT_README.md)。

## 文档结构

```
├── docs/                    # 文档源文件目录
│   ├── ad/                 # AD 域控相关文档
│   ├── datacom/            # 数据通信相关文档
│   ├── security/           # 信息安全相关文档
│   └── demo/               # 演示文档
├── material/               # Material 主题自定义文件
│   └── overrides/
│       ├── assets/         # 自定义资源（CSS、JS）
│       └── hooks/          # MkDocs hooks（加密处理）
├── tools/                  # 工具脚本
│   └── encrypt.py          # 加密工具
├── mkdocs.yml             # MkDocs 配置文件
└── requirements.txt       # Python 依赖
```

## 开发说明

### 修改文档

直接编辑 `docs/` 目录下的 Markdown 文件即可，MkDocs 会自动检测变化并重新加载。

### 修改主题

如果需要修改 Material 主题的样式或功能：

1. 安装 Node.js（需要 Node >= 18）
2. 安装前端依赖：
   ```powershell
   npm install
   ```
3. 启动主题开发模式（监听文件变化）：
   ```powershell
   npm run start
   ```

### 自定义样式和脚本

- **页面过渡动画**：`material/overrides/assets/stylesheets/page-transitions.css`
- **加密功能样式**：`material/overrides/assets/stylesheets/encrypt.css`
- **加密解密脚本**：`material/overrides/assets/javascripts/encrypt.js`
- **页面过渡脚本**：`material/overrides/assets/javascripts/page-transitions.js`

## 部署

项目已配置 GitHub Actions 自动部署到 GitHub Pages。每次推送到 `main` 分支时会自动构建并部署。

* 部署配置位于：`.github/workflows/deploy.yml`
* 工具：[cryptography](https://cryptography.io/) - Python 加密库