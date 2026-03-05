#!/bin/bash

# Copaw 服务管理脚本
# 用于注册、管理 Copaw 服务的 systemctl 服务

set -e

SERVICE_NAME="copaw"
SERVICE_DESCRIPTION="Copaw Application Service"
PORT=8088
USER=$(whoami)
WORKING_DIR=$(pwd)
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        echo "错误: 此脚本需要以 root 权限运行，请使用 sudo 或以 root 用户身份运行。" >&2
        exit 1
    fi
}

# 显示使用说明
show_usage() {
    echo "使用方法:"
    echo "  $0 install     - 安装并注册 systemctl 服务"
    echo "  $0 start      - 启动服务"
    echo "  $0 stop       - 停止服务"
    echo "  $0 restart    - 重启服务"
    echo "  $0 status     - 查看服务状态"
    echo "  $0 logs       - 查看服务日志"
    echo "  $0 remove     - 卸载服务"
    echo ""
    echo "注意: 请在项目的根目录下运行此脚本"
}

# 安装服务
install_service() {
    echo "正在安装 ${SERVICE_NAME} 服务..."

    # 获取当前用户的 Python 解释器路径
    PYTHON_PATH=$(which python3 || which python)
    if [[ -z "$PYTHON_PATH" ]]; then
        echo "错误: 未找到 Python 解释器" >&2
        exit 1
    fi

    # 检查 copaw 命令是否存在
    if ! command -v copaw &> /dev/null; then
        echo "错误: copaw 命令未找到。请确保已安装 copaw。" >&2
        exit 1
    fi

    # 创建服务文件
    cat << EOF > "${SERVICE_FILE}"
[Unit]
Description=${SERVICE_DESCRIPTION}
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$WORKING_DIR
Environment=PATH=$PATH
ExecStart=/usr/bin/env bash -c 'copaw app --host 0.0.0.0 --port $PORT --reload'
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    # 设置适当的权限
    chmod 644 "${SERVICE_FILE}"

    # 重新加载 systemd 配置
    systemctl daemon-reload

    # 启用服务（开机自启）
    systemctl enable "${SERVICE_NAME}.service"

    echo "服务 ${SERVICE_NAME} 已成功安装并启用开机自启。"
    echo "您可以使用以下命令管理服务："
    echo "  sudo systemctl start ${SERVICE_NAME}"
    echo "  sudo systemctl stop ${SERVICE_NAME}"
    echo "  sudo systemctl restart ${SERVICE_NAME}"
    echo "  sudo systemctl status ${SERVICE_NAME}"
    echo "  sudo journalctl -u ${SERVICE_NAME} -f"
}

# 启动服务
start_service() {
    echo "正在启动 ${SERVICE_NAME} 服务..."
    systemctl start "${SERVICE_NAME}.service"
    echo "${SERVICE_NAME} 服务已启动。"
}

# 停止服务
stop_service() {
    echo "正在停止 ${SERVICE_NAME} 服务..."
    systemctl stop "${SERVICE_NAME}.service"
    echo "${SERVICE_NAME} 服务已停止。"
}

# 重启服务
restart_service() {
    echo "正在重启 ${SERVICE_NAME} 服务..."
    systemctl restart "${SERVICE_NAME}.service"
    echo "${SERVICE_NAME} 服务已重启。"
}

# 查看服务状态
status_service() {
    echo "正在查看 ${SERVICE_NAME} 服务状态..."
    systemctl status "${SERVICE_NAME}.service"
}

# 查看服务日志
logs_service() {
    echo "正在查看 ${SERVICE_NAME} 服务日志..."
    journalctl -u "${SERVICE_NAME}.service" -f
}

# 卸载服务
remove_service() {
    echo "正在卸载 ${SERVICE_NAME} 服务..."
    
    # 停止服务
    if systemctl is-active --quiet "${SERVICE_NAME}.service"; then
        systemctl stop "${SERVICE_NAME}.service"
        echo "服务已停止。"
    fi
    
    # 禁用服务
    if systemctl is-enabled --quiet "${SERVICE_NAME}.service"; then
        systemctl disable "${SERVICE_NAME}.service"
        echo "服务已禁用开机自启。"
    fi
    
    # 删除服务文件
    if [[ -f "${SERVICE_FILE}" ]]; then
        rm "${SERVICE_FILE}"
        echo "服务文件已删除。"
    fi
    
    # 重新加载 systemd 配置
    systemctl daemon-reload
    systemctl reset-failed "${SERVICE_NAME}.service" 2>/dev/null || true
    
    echo "${SERVICE_NAME} 服务已成功卸载。"
}

# 主逻辑
case "$1" in
    install)
        check_root
        install_service
        ;;
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        status_service
        ;;
    logs)
        logs_service
        ;;
    remove)
        check_root
        remove_service
        ;;
    *)
        show_usage
        ;;
esac