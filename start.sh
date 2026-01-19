#!/bin/bash
# MkDocs 文档站一键启动脚本
# 用于本地启动和预览文档站点（macOS/Linux）

echo "========================================"
echo "  MkDocs 文档站启动脚本"
echo "========================================"
echo ""

# 检查 Python 是否安装
echo "[1/5] 检查 Python 环境..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1)
    echo "✓ 找到 Python: $PYTHON_VERSION"
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1)
    echo "✓ 找到 Python: $PYTHON_VERSION"
    PYTHON_CMD=python
else
    echo "✗ 错误: 未找到 Python，请先安装 Python 3.8 或更高版本"
    echo "macOS 安装方法: brew install python3"
    exit 1
fi

# 检查虚拟环境是否存在
VENV_PATH=".venv"

if [ ! -d "$VENV_PATH" ]; then
    echo "[2/5] 创建 Python 虚拟环境..."
    $PYTHON_CMD -m venv $VENV_PATH
    if [ $? -ne 0 ]; then
        echo "✗ 创建虚拟环境失败"
        exit 1
    fi
    echo "✓ 虚拟环境创建成功"
else
    echo "[2/5] 虚拟环境已存在，跳过创建"
fi

# 激活虚拟环境
echo "[3/5] 激活虚拟环境..."
source $VENV_PATH/bin/activate
if [ $? -ne 0 ]; then
    echo "✗ 无法激活虚拟环境"
    exit 1
fi
echo "✓ 虚拟环境已激活"

# 升级 pip
echo "[4/5] 升级 pip 并安装依赖..."
$PYTHON_CMD -m pip install --upgrade pip --quiet
if [ $? -ne 0 ]; then
    echo "✗ pip 升级失败"
    exit 1
fi

# 安装依赖
echo "  正在安装依赖包（这可能需要几分钟）..."
$PYTHON_CMD -m pip install mkdocs-material mkdocs-minify-plugin --quiet
if [ $? -ne 0 ]; then
    echo "✗ 安装 mkdocs-material 失败"
    exit 1
fi

if [ -f "requirements.txt" ]; then
    $PYTHON_CMD -m pip install -r requirements.txt --quiet
    if [ $? -ne 0 ]; then
        echo "✗ 安装 requirements.txt 依赖失败"
        exit 1
    fi
fi

echo "✓ 依赖安装完成"

# 启动 MkDocs 服务器
echo ""
echo "[5/5] 启动 MkDocs 开发服务器..."
echo ""
echo "========================================"
echo "  文档站点将在以下地址启动:"
echo "  http://127.0.0.1:8000"
echo ""
echo "  按 Ctrl+C 停止服务器"
echo "========================================"
echo ""

$PYTHON_CMD -m mkdocs serve
