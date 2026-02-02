# MkDocs documentation site one-click start script
# Used to start and preview the documentation site locally

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MkDocs Documentation Site Starter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "[1/5] Checking Python environment..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: Python not found. Please install Python 3.8 or higher first." -ForegroundColor Red
    Write-Host "Download: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Check if virtual environment exists
$venvPath = ".venv"
$venvExists = Test-Path $venvPath

if (-not $venvExists) {
    Write-Host "[2/5] Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv $venvPath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Virtual environment created successfully" -ForegroundColor Green
} else {
    Write-Host "[2/5] Virtual environment already exists, skipping creation" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "[3/5] Activating virtual environment..." -ForegroundColor Yellow
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    & $activateScript
    Write-Host "✓ Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "✗ Could not find virtual environment activation script" -ForegroundColor Red
    exit 1
}

# Upgrade pip
Write-Host "[4/5] Upgrading pip and installing dependencies..." -ForegroundColor Yellow
python -m pip install --no-cache-dir --upgrade pip --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to upgrade pip" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "  Installing dependencies (this may take a few minutes)..." -ForegroundColor Gray
python -m pip install --no-cache-dir mkdocs-material mkdocs-minify-plugin --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install mkdocs-material" -ForegroundColor Red
    exit 1
}

if (Test-Path "requirements.txt") {
    python -m pip install --no-cache-dir -r requirements.txt --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to install dependencies from requirements.txt" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Dependency installation completed" -ForegroundColor Green

# Start MkDocs server
Write-Host ""
Write-Host "[5/5] Starting MkDocs development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  The documentation site will be available at:" -ForegroundColor Cyan
Write-Host "  http://127.0.0.1:8000" -ForegroundColor Green
Write-Host ""
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

python -m mkdocs serve