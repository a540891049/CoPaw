import { Layout, Button, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import {
  FileTextOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { Button, Tooltip } from "@agentscope-ai/design";
import styles from "./index.module.less";

const { Header: AntHeader } = Layout;

// Navigation URLs
const NAV_URLS = {
  docs: "https://copaw.agentscope.io/docs/intro",
  faq: "https://copaw.agentscope.io/docs/faq",
  changelog: "https://github.com/agentscope-ai/CoPaw/releases",
  github: "https://github.com/agentscope-ai/CoPaw",
} as const;

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

  const handleNavClick = (url: string) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <AntHeader className={styles.header}>
      <span className={styles.headerTitle}>
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
