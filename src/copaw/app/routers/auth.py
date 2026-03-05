from fastapi import APIRouter, HTTPException, Request, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import hashlib
import secrets
from datetime import datetime, timedelta
from ..auth import get_password_from_env, set_password_in_env

# 简单的内存 Session 存储（生产环境应使用 Redis 等）
active_sessions: dict[str, dict] = {}

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
    return get_password_from_env() is not None

# 模拟函数：验证密码
async def verify_password(plain_password: str) -> bool:
    stored_password = get_password_from_env()
    if not stored_password:
        return False
    # 注意：生产环境应使用更安全的哈希（如 bcrypt）。
    # 这里为保持与设置逻辑一致，仍进行明文比较。
    return plain_password == stored_password

# 创建 Session
async def create_session() -> str:
    session_id = secrets.token_hex(32)
    active_sessions[session_id] = {
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(days=7)  # 7 天有效期
    }
    return session_id

# 验证 Session
async def verify_session(session_id: str) -> bool:
    if session_id not in active_sessions:
        return False
    session = active_sessions[session_id]
    if datetime.now() > session["expires_at"]:
        # Session 过期，删除
        del active_sessions[session_id]
        return False
    return True

# 删除 Session
async def delete_session(session_id: str) -> bool:
    if session_id in active_sessions:
        del active_sessions[session_id]
        return True
    return False

@router.get("/auth/status")
async def auth_status():
    """检查认证状态，判断是否为首次访问。"""
    has_password = await has_password_set()
    return {"hasPassword": has_password}

@router.get("/auth/check")
async def check_auth(request: Request):
    """检查用户是否已登录。"""
    session_id = request.cookies.get("session_id")
    if not session_id:
        return {"isAuthenticated": False}
    
    is_valid = await verify_session(session_id)
    return {"isAuthenticated": is_valid}

@router.post("/auth/logout")
async def logout(request: Request):
    """用户退出登录。"""
    session_id = request.cookies.get("session_id")
    if session_id:
        await delete_session(session_id)
    
    # 清除 Cookie
    response = JSONResponse(content={"message": "退出成功"})
    response.delete_cookie(key="session_id")
    return response

@router.post("/auth/setup")
async def setup_password(data: PasswordSetup):
    """首次设置密码。"""
    if data.password != data.confirmPassword:
        raise HTTPException(status_code=400, detail="两次输入的密码不匹配")
    
    success = set_password_in_env(data.password)
    if not success:
        raise HTTPException(status_code=500, detail="设置密码失败")
    
    return {"message": "密码设置成功"}

@router.post("/auth/login")
async def login(request: Request, data: PasswordLogin):
    """用户登录验证。"""
    is_valid = await verify_password(data.password)
    if not is_valid:
        raise HTTPException(status_code=401, detail="密码错误")
    
    # 创建 Session
    session_id = await create_session()
    
    # 返回 Session ID 并设置 Cookie
    response = JSONResponse(content={"message": "登录成功"})
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        max_age=60 * 60 * 24 * 7,  # 7 天
        expires=60 * 60 * 24 * 7,
    )
    return response