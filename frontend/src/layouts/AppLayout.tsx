import {
  AppstoreOutlined,
  DatabaseOutlined,
  FormOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  ReloadOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { Alert, Button, Layout, Menu, Space, Spin, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, isFetching, canWrite } = useAuth();

  const selectedKeys = useMemo(() => {
    if (location.pathname.startsWith('/assets')) return ['/assets'];
    if (location.pathname.startsWith('/renewals')) return ['/renewals/create'];
    if (location.pathname.startsWith('/masters/categories')) return ['/masters/categories'];
    if (location.pathname.startsWith('/masters/locations')) return ['/masters/locations'];
    if (location.pathname.startsWith('/masters/suppliers')) return ['/masters/suppliers'];
    if (location.pathname.startsWith('/masters/units')) return ['/masters/units'];
    return ['/assets'];
  }, [location.pathname]);

  return (
    <Layout className="app-shell">
      <Sider trigger={null} collapsible collapsed={collapsed} breakpoint="lg">
        <div style={{ padding: 20, color: '#fff', fontWeight: 700, fontSize: 18 }}>
          {collapsed ? 'IT' : 'IT Asset System'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={[
            { key: '/assets', icon: <AppstoreOutlined />, label: <Link to="/assets">Assets</Link> },
            { key: '/renewals/create', icon: <ReloadOutlined />, label: <Link to="/renewals/create">Renewals</Link> },
            { key: '/masters/categories', icon: <TagsOutlined />, label: <Link to="/masters/categories">Categories</Link> },
            { key: '/masters/locations', icon: <DatabaseOutlined />, label: <Link to="/masters/locations">Locations</Link> },
            { key: '/masters/suppliers', icon: <FormOutlined />, label: <Link to="/masters/suppliers">Suppliers</Link> },
            { key: '/masters/units', icon: <PlusOutlined />, label: <Link to="/masters/units">Units</Link> },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
            />
            <Typography.Title level={4} style={{ margin: 0 }}>
              IT Asset Management & Renewal
            </Typography.Title>
          </Space>
          <Space>
            {isLoading ? <Spin size="small" /> : null}
            <Typography.Text>{user?.username ?? 'guest'}</Typography.Text>
            <Typography.Text type="secondary">Role: {user?.role ?? 'read'}</Typography.Text>
          </Space>
        </Header>
        <Content className="app-content">
          {!canWrite ? (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message="Read-only mode"
              description="Authenticated role is read-only. Create, edit, delete, and renewal submission actions are disabled."
            />
          ) : null}
          {!isLoading && !isFetching && user?.username === 'local-admin' ? (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="Authentication fallback active"
              description="GET /api/me is unavailable or returned an error, so the UI is temporarily using a local write-enabled admin profile for testing."
            />
          ) : null}
          <Outlet context={{ navigate }} />
        </Content>
      </Layout>
    </Layout>
  );
}
