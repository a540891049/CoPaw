import { Layout, Button as AntButton, Modal, message, Space } from "antd";
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
        <Space size="middle">
          <Tooltip title={t("header.changelog")}>
            <Button
              icon={<FileTextOutlined />}
              type="text"
              onClick={() => handleNavClick(NAV_URLS.changelog)}
            >
              {t("header.changelog")}
            </Button>
          </Tooltip>
          <Tooltip title={t("header.docs")}>
            <Button
              icon={<BookOutlined />}
              type="text"
              onClick={() => handleNavClick(NAV_URLS.docs)}
            >
              {t("header.docs")}
            </Button>
          </Tooltip>
          <Tooltip title={t("header.faq")}>
            <Button
              icon={<QuestionCircleOutlined />}
              type="text"
              onClick={() => handleNavClick(NAV_URLS.faq)}
            >
              {t("header.faq")}
            </Button>
          </Tooltip>
          <Tooltip title={t("header.github")}>
            <Button
              icon={<GithubOutlined />}
              type="text"
              onClick={() => handleNavClick(NAV_URLS.github)}
            >
              {t("header.github")}
            </Button>
          </Tooltip>
        </Space>
        <LanguageSwitcher />
        <AntButton onClick={handleLogout} danger>
          退出登录
        </AntButton>
      </div>
    </AntHeader>
  );
}
