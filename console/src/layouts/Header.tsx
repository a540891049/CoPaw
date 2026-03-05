import { Layout, Button, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const { Header: AntHeader } = Layout;

const keyToLabel: Record<string, string> = {
  chat: "nav.chat",
  channels: "nav.channels",
  sessions: "nav.sessions",
  "cron-jobs": "nav.cronJobs",
  heartbeat: "nav.heartbeat",
  skills: "nav.skills",
  mcp: "nav.mcp",
  "agent-config": "nav.agentConfig",
  workspace: "nav.workspace",
  models: "nav.models",
  environments: "nav.environments",
};

interface HeaderProps {
  selectedKey: string;
}

export default function Header({ selectedKey }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch('/auth/logout', {
            method: 'POST',
          });
          
          if (response.ok) {
            message.success('已退出登录');
            navigate('/login');
          } else {
            message.error('退出失败');
          }
        } catch (error) {
          console.error('退出登录失败', error);
          message.error('退出失败');
        }
      },
    });
  };

  return (
    <AntHeader
      style={{
        height: 64,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <span style={{ fontSize: 18, fontWeight: 500 }}>
        {t(keyToLabel[selectedKey] || "nav.chat")}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <LanguageSwitcher />
        <Button onClick={handleLogout} danger>
          退出登录
        </Button>
      </div>
    </AntHeader>
  );
}
