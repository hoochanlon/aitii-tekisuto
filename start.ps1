# MkDocs 文档站一键启动脚本
# 用于本地启动和预览文档站点

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MkDocs 文档站启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Python 是否安装
Write-Host "[1/5] 检查 Python 环境..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ 找到 Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 错误: 未找到 Python，请先安装 Python 3.8 或更高版本" -ForegroundColor Red
    Write-Host "下载地址: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# 检查虚拟环境是否存在
$venvPath = ".venv"
$venvExists = Test-Path $venvPath

if (-not $venvExists) {
    Write-Host "[2/5] 创建 Python 虚拟环境..." -ForegroundColor Yellow
    python -m venv $venvPath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 创建虚拟环境失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ 虚拟环境创建成功" -ForegroundColor Green
} else {
    Write-Host "[2/5] 虚拟环境已存在，跳过创建" -ForegroundColor Green
}

# 激活虚拟环境
Write-Host "[3/5] 激活虚拟环境..." -ForegroundColor Yellow
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    & $activateScript
    Write-Host "✓ 虚拟环境已激活" -ForegroundColor Green
} else {
    Write-Host "✗ 无法找到虚拟环境激活脚本" -ForegroundColor Red
    exit 1
}

# 升级 pip
Write-Host "[4/5] 升级 pip 并安装依赖..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ pip 升级失败" -ForegroundColor Red
    exit 1
}

# 安装依赖
Write-Host "  正在安装依赖包（这可能需要几分钟）..." -ForegroundColor Gray
python -m pip install mkdocs-material mkdocs-minify-plugin --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 安装 mkdocs-material 失败" -ForegroundColor Red
    exit 1
}

if (Test-Path "requirements.txt") {
    python -m pip install -r requirements.txt --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 安装 requirements.txt 依赖失败" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ 依赖安装完成" -ForegroundColor Green

# 启动 MkDocs 服务器
Write-Host ""
Write-Host "[5/5] 启动 MkDocs 开发服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  文档站点将在以下地址启动:" -ForegroundColor Cyan
Write-Host "  http://127.0.0.1:8000" -ForegroundColor Green
Write-Host ""
Write-Host "  按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

python -m mkdocs serve

