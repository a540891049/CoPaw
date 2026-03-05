import os
import platform
from typing import Optional

def get_password_from_env() -> Optional[str]:
    """从环境变量 COPAW_PASSWORD 中读取密码。"""
    return os.environ.get("COPAW_PASSWORD")

def set_password_in_env(password: str) -> bool:
    """将密码安全地写入系统环境变量 COPAW_PASSWORD。
    
    Args:
        password: 要设置的密码字符串
    
    Returns:
        bool: 操作是否成功
    """
    try:
        if platform.system() == "Windows":
            # Windows: 使用 setx 命令
            import subprocess
            result = subprocess.run(
                ["setx", "COPAW_PASSWORD", password],
                capture_output=True,
                text=True,
                check=True
            )
            # setx 会同时设置当前进程和用户环境，但当前 Python 进程需要手动更新
            os.environ["COPAW_PASSWORD"] = password
            return True
        else:
            # Linux: 尝试写入 ~/.bashrc 或 ~/.profile 以实现持久化
            import subprocess
            shell_config_files = ["~/.bashrc", "~/.profile"]
            success = False
            for file in shell_config_files:
                try:
                    full_path = os.path.expanduser(file)
                    # 移除旧的导出语句
                    subprocess.run([
                        "sed", "-i", f"/export COPAW_PASSWORD/d", full_path
                    ], check=False)
                    # 添加新的导出语句
                    with open(full_path, "a") as f:
                        f.write(f"\nexport COPAW_PASSWORD='{password}'\n")
                    success = True
                    break # 成功写入一个文件后退出
                except Exception as e:
                    print(f"Failed to write to {file}: {e}")
                    continue
            if not success:
                return False
            # 同时更新当前进程环境变量
            os.environ["COPAW_PASSWORD"] = password
            return True
    except Exception as e:
        print(f"Error setting password in environment: {e}")
        return False