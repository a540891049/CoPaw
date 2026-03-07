#!/bin/bash

# Copaw 服务更新与启动脚本
# 用于自动化停止服务、拉取最新代码、构建前端、启动服务

set -e

SERVICE_NAME="copaw"
LOG_FILE="/tmp/${SERVICE_NAME}_update.log"

# 记录日志的函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 错误处理函数
error_exit() {
    log "错误: $1"
    exit 1
}

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        echo "警告: 此脚本需要以 root 权限执行某些操作，部分命令可能需要 sudo 权限。"
    fi
}

# 步骤1：停止 copaw 服务
stop_service() {
    log "步骤1: 正在停止 ${SERVICE_NAME} 服务..."
    
    if systemctl is-active --quiet "${SERVICE_NAME}.service"; then
        log "检测到 ${SERVICE_NAME} 服务正在运行，正在停止..."
        if sudo systemctl stop "${SERVICE_NAME}.service"; then
            log "${SERVICE_NAME} 服务已停止。"
        else
            error_exit "停止 ${SERVICE_NAME} 服务失败"
        fi
    else
        log "${SERVICE_NAME} 服务未运行，跳过停止步骤。"
    fi
}

# 步骤2：更新仓库代码
update_code() {
    log "步骤2: 正在更新仓库代码..."
    
    if ! command -v git &> /dev/null; then
        error_exit "git 命令未找到，请先安装 git"
    fi
    
    # 确保在项目根目录
    PROJECT_ROOT=$(pwd)
    if [[ ! -d ".git" ]]; then
        error_exit "当前目录不是 git 仓库，请在项目根目录下运行此脚本"
    fi
    
    # 拉取最新代码
    if git pull origin $(git branch --show-current 2>/dev/null || echo "main"); then
        log "代码更新成功。"
    else
        error_exit "代码更新失败"
    fi
}

# 步骤3：编译前端代码
build_frontend() {
    log "步骤3: 正在编译前端代码..."
    
    if ! command -v npm &> /dev/null; then
        error_exit "npm 命令未找到，请先安装 Node.js 和 npm"
    fi
    
    # 进入 console 目录并构建
    cd console || error_exit "无法进入 console 目录，请确保该目录存在"
    
    if npm run build; then
        log "前端代码编译成功。"
    else
        log "前端代码编译失败，尝试重新安装依赖..."
        if npm ci; then
            log "依赖安装成功，重新编译..."
            if npm run build; then
                log "前端代码编译成功。"
            else
                error_exit "重新编译前端代码仍然失败"
            fi
        else
            error_exit "npm ci 安装依赖失败"
        fi
    fi
    
    # 返回项目根目录
    cd ..
}

# 步骤4：启动 copaw 服务
start_service() {
    log "步骤4: 正在启动 ${SERVICE_NAME} 服务..."
    
    if sudo systemctl start "${SERVICE_NAME}.service"; then
        log "${SERVICE_NAME} 服务启动命令已发送。"
    else
        error_exit "启动 ${SERVICE_NAME} 服务失败"
    fi
    
    # 等待服务启动
    log "等待服务启动..."
    sleep 5
    
    # 检查服务状态
    if systemctl is-active --quiet "${SERVICE_NAME}.service"; then
        log "${SERVICE_NAME} 服务已成功启动并正在运行。"
        log "服务状态: $(systemctl is-active "${SERVICE_NAME}.service")"
    else
        log "${SERVICE_NAME} 服务可能启动失败，请检查服务状态。"
        sudo systemctl status "${SERVICE_NAME}.service" || true
        error_exit "服务启动失败"
    fi
}

# 显示使用说明
show_usage() {
    echo "使用方法:"
    echo "  $0          - 执行完整的更新和启动流程"
    echo "  $0 --help   - 显示此帮助信息"
    echo ""
    echo "注意: 请在项目的根目录下运行此脚本，且部分操作需要 sudo 权限。"
}

# 主流程
main() {
    log "==========================================="
    log "开始执行 Copaw 服务更新与启动流程"
    log "==========================================="
    
    check_root
    stop_service
    update_code
    build_frontend
    start_service
    
    log "==========================================="
    log "Copaw 服务更新与启动流程已完成！"
    log "==========================================="
    
    # 显示最终服务状态
    log "当前服务状态:"
    sudo systemctl status "${SERVICE_NAME}.service" --no-pager -l || true
}

# 解析命令行参数
case "$1" in
    --help|-h)
        show_usage
        exit 0
        ;;
    "")
        main
        ;;
    *)
        echo "未知参数: $1"
        show_usage
        exit 1
        ;;
esac