import { Breadcrumb, Space, Typography } from 'antd';
import type { ReactNode } from 'react';

interface AppPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: { title: string }[];
}

export default function AppPageHeader({ title, subtitle, actions, breadcrumb }: AppPageHeaderProps) {
  return (
    <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 20 }}>
      {breadcrumb ? <Breadcrumb items={breadcrumb} /> : null}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {subtitle ? (
            <Typography.Text type="secondary">{subtitle}</Typography.Text>
          ) : null}
        </div>
        {actions ? <div className="page-actions">{actions}</div> : null}
      </div>
    </Space>
  );
}
