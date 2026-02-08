# 修复加密问题的自动化脚本
# 清理并重新构建站点，确保使用正确的密码重新加密

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "修复加密问题 - 自动化处理" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 设置工作目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# 1. 清理旧的构建文件
Write-Host "[1/4] 清理旧的构建文件..." -ForegroundColor Yellow
if (Test-Path "site") {
    Remove-Item -Recurse -Force "site"
    Write-Host "  ✓ 已删除 site 目录" -ForegroundColor Green
} else {
    Write-Host "  ℹ site 目录不存在，跳过" -ForegroundColor Gray
}

# 2. 检查并安装依赖
Write-Host ""
Write-Host "[2/4] 检查依赖..." -ForegroundColor Yellow
try {
    $mkdocsVersion = python -m mkdocs --version 2>&1
    Write-Host "  ✓ MkDocs 已安装" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ MkDocs 未安装，尝试安装..." -ForegroundColor Yellow
    python -m pip install mkdocs-material --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ MkDocs 安装成功" -ForegroundColor Green
    } else {
        Write-Host "  ✗ MkDocs 安装失败，请手动安装: pip install mkdocs-material" -ForegroundColor Red
        exit 1
    }
}

# 3. 重新构建站点
Write-Host ""
Write-Host "[3/4] 重新构建站点（使用正确的密码重新加密）..." -ForegroundColor Yellow
Write-Host "  这可能需要一些时间，请稍候..." -ForegroundColor Gray
Write-Host ""

$buildOutput = python -m mkdocs build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ 构建成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "所有页面已使用正确的密码重新加密。" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "现在可以启动服务器：" -ForegroundColor Yellow
    Write-Host "  python -m mkdocs serve" -ForegroundColor White
    Write-Host ""
    Write-Host "或者直接打开构建后的站点：" -ForegroundColor Yellow
    Write-Host "  start site/index.html" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ 构建失败！" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "错误信息：" -ForegroundColor Yellow
    Write-Host $buildOutput
    Write-Host ""
    Write-Host "请检查错误信息并修复后重试。" -ForegroundColor Yellow
    exit 1
}
