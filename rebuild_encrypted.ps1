# 重新构建加密站点脚本
# 清理旧的构建文件并使用正确的密码重新加密

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "重新构建加密站点" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 清理旧的构建文件
Write-Host "[1/3] 清理旧的构建文件..." -ForegroundColor Yellow
if (Test-Path "site") {
    Remove-Item -Recurse -Force "site"
    Write-Host "  ✓ 已删除 site 目录" -ForegroundColor Green
} else {
    Write-Host "  ℹ site 目录不存在，跳过" -ForegroundColor Gray
}

# 2. 验证加密/解密工具（可选）
Write-Host ""
Write-Host "[2/3] 验证加密/解密工具..." -ForegroundColor Yellow
$testScript = Join-Path (Get-Location) "tools\test_encrypt_decrypt.py"
if (Test-Path $testScript) {
    $testResult = python $testScript 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ 加密/解密工具正常工作" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ 加密/解密工具测试失败，但继续构建..." -ForegroundColor Yellow
    }
} else {
    Write-Host "  ℹ 测试脚本不存在，跳过验证" -ForegroundColor Gray
}

# 3. 重新构建站点
Write-Host ""
Write-Host "[3/3] 重新构建站点..." -ForegroundColor Yellow
Write-Host "  这可能需要一些时间..." -ForegroundColor Gray

$buildOutput = mkdocs build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ 构建成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "现在可以启动服务器：" -ForegroundColor Cyan
    Write-Host "  mkdocs serve" -ForegroundColor White
    Write-Host ""
    Write-Host "或者直接打开：" -ForegroundColor Cyan
    Write-Host "  start http://localhost:8000" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ 构建失败！" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "错误信息：" -ForegroundColor Yellow
    Write-Host $buildOutput
    exit 1
}
