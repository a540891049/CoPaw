from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import hashlib

class PasswordSetup(BaseModel):
    password: str
    confirmPassword: str

class PasswordLogin(BaseModel):
    password: str

router = APIRouter()

# 一个简单的内存存储，用于演示。实际应用中应使用更安全的存储。
# 这里我们模拟检查环境变量的行为。
# 在真实场景中，get_password_from_env() 会从系统环境读取。

# 模拟函数：检查密码是否已设置
async def has_password_set() -> bool:
    from .auth import get_password_from_env
    return get_password_from_env() is not None

# 模拟函数：验证密码
async def verify_password(plain_password: str) -> bool:
    from .auth import get_password_from_env
    stored_password = get_password_from_env()
    if not stored_password:
        return False
    # 注意：生产环境应使用更安全的哈希（如bcrypt）。
    # 这里为保持与设置逻辑一致，仍进行明文比较。
    return plain_password == stored_password

@router.get("/auth/status")
async def auth_status():
    """检查认证状态，判断是否为首次访问。"""
    has_password = await has_password_set()
    return {"hasPassword": has_password}

@router.post("/auth/setup")
async def setup_password(request: Request, data: PasswordSetup):
    """首次设置密码。"""
    if data.password != data.confirmPassword:
        raise HTTPException(status_code=400, detail="两次输入的密码不匹配")
    
    success = set_password_in_env(data.password)
    if not success:
        raise HTTPException(status_code=500, detail="设置密码失败")
    
    return {"message": "密码设置成功"}

@router.post("/auth/login")
async def login(data: PasswordLogin):
    """用户登录验证。"""
    is_valid = await verify_password(data.password)
    if not is_valid:
        raise HTTPException(status_code=401, detail="密码错误")
    return {"message": "登录成功"}