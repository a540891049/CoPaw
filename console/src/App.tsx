import { createGlobalStyle } from "antd-style";
import { ConfigProvider, bailianTheme } from "@agentscope-ai/design";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login/index.tsx";
import "./styles/layout.css";
import "./styles/form-override.css";

const GlobalStyle = createGlobalStyle`
* {
  margin: 0;
  box-sizing: border-box;
}
`;

function AuthGuard({ children }: { children: JSX.Element }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 首先检查是否设置了密码
        const statusResponse = await fetch("/auth/status");
        const statusData = await statusResponse.json();
        
        // 如果没有设置密码（首次访问），则重定向到登录页
        if (!statusData.hasPassword) {
          setIsAuthenticated(false);
        } else {
          // 密码已设置，检查用户是否已登录
          const checkResponse = await fetch("/auth/check");
          const checkData = await checkResponse.json();
          
          if (checkData.isAuthenticated) {
            // 已登录，允许访问
            setIsAuthenticated(true);
          } else {
            // 未登录，重定向到登录页
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("获取认证状态失败", error);
        // 出错时也重定向到登录页
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  if (checkingAuth) {
    // 检查认证状态时显示加载中
    return <div>加载中...</div>;
  }
  
  if (isAuthenticated === false) {
    // 未认证，重定向到登录页
    return <Navigate to="/login" replace />;
  }
  
  // 已认证，渲染子组件
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <ConfigProvider {...bailianTheme} prefix="copaw" prefixCls="copaw">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          } />
        </Routes>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
