import { Button, Card, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [loading, setLoading] = useState(true);

  // 检查是否为首次访问（无密码时）
  useEffect(() => {
    fetch("/auth/status")
      .then((res) => res.json())
      .then((data) => {
        setIsFirstTime(!data.hasPassword);
        setLoading(false);
      })
      .catch((err) => {
        message.error("无法连接到服务器");
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 处理密码设置或登录提交
  const handleSubmit = async (values: { password: string; confirmPassword?: string }) => {
    try {
      const endpoint = isFirstTime ? "/auth/setup" : "/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "操作失败");
      }

      message.success(isFirstTime ? "密码设置成功" : "登录成功");
      
      // 立即检查认证状态，确保 Cookie 已设置
      setTimeout(async () => {
        try {
          const checkResponse = await fetch('/auth/check');
          const checkData = await checkResponse.json();
          
          if (checkData.isAuthenticated) {
            // 如果认证成功，跳转到聊天页面
            navigate('/chat');
          } else {
            // 如果认证失败，刷新页面以重新检查认证状态
            window.location.reload();
          }
        } catch (error) {
          console.error('检查认证状态失败:', error);
          // 出错时也刷新页面
          window.location.reload();
        }
      }, 200); // 稍微增加延迟时间以确保 Cookie 设置完成
    } catch (error: any) {
      message.error(error.message);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card title={isFirstTime ? "设置密码" : "登录"} style={{ width: 400 }}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          
          {isFirstTime && (
            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={["password"]}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不匹配!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请再次输入密码" />
            </Form.Item>
          )}
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={false}>
              {isFirstTime ? "设置并登录" : "登录"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;