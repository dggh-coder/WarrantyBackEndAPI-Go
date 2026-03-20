import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Input, Select, Space, Table, Tag, Tooltip, Typography, App as AntdApp } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppErrorResult from '../components/AppErrorResult';
import AppPageHeader from '../components/AppPageHeader';
import AssetStatusTag from '../components/AssetStatusTag';
import { useAssets, useDeleteAsset } from '../hooks/useAssets';
import { useAuth } from '../hooks/useAuth';
import type { AssetRecord } from '../types/asset';
import { formatDate, isExpiringSoon } from '../utils/date';
import { getErrorMessage } from '../utils/error';

const { Search } = Input;

export default function AssetListPage() {
  const navigate = useNavigate();
  const { message, modal } = AntdApp.useApp();
  const { user, canWrite } = useAuth();
  const { data: assets = [], isLoading, isError, error, refetch } = useAssets();
  const deleteMutation = useDeleteAsset();
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'expiring'>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 10 });

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = [asset.item_number, asset.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search.toLowerCase()));

      const matchesFilter = filterMode === 'all' || isExpiringSoon(asset.next_billing_date, asset.remind_before_days);
      return matchesSearch && matchesFilter;
    });
  }, [assets, filterMode, search]);

  const selectedAssets = useMemo(
    () => assets.filter((asset) => selectedRowKeys.includes(asset.id)),
    [assets, selectedRowKeys],
  );

  const handleDelete = (record: AssetRecord) => {
    modal.confirm({
      title: `Delete ${record.item_number}?`,
      content: 'This action cannot be undone.',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(record.id);
          message.success('Asset deleted');
        } catch (deleteError) {
          message.error(getErrorMessage(deleteError));
        }
      },
    });
  };

  const columns: ColumnsType<AssetRecord> = [
    {
      title: 'Item Number',
      dataIndex: 'item_number',
      sorter: (a, b) => a.item_number.localeCompare(b.item_number),
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/assets/${record.id}`)} style={{ padding: 0 }}>
          {record.item_number}
        </Button>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => (a.name ?? '').localeCompare(b.name ?? ''),
      render: (_, record) => record.name || '-',
    },
    {
      title: 'Category',
      render: (_, record) => record.category?.name ?? '-',
      sorter: (a, b) => (a.category?.name ?? '').localeCompare(b.category?.name ?? ''),
    },
    {
      title: 'Location',
      render: (_, record) => record.location?.name ?? '-',
      sorter: (a, b) => (a.location?.name ?? '').localeCompare(b.location?.name ?? ''),
    },
    {
      title: 'Supplier',
      render: (_, record) => record.supplier?.name ?? '-',
      sorter: (a, b) => (a.supplier?.name ?? '').localeCompare(b.supplier?.name ?? ''),
    },
    {
      title: 'Next Billing Date',
      dataIndex: 'next_billing_date',
      sorter: (a, b) => a.next_billing_date.localeCompare(b.next_billing_date),
      render: (value, record) => (
        <Space>
          <span>{formatDate(value)}</span>
          {isExpiringSoon(record.next_billing_date, record.remind_before_days) ? <Tag color="red">Expiring soon</Tag> : null}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <AssetStatusTag status={status} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View detail">
            <Button icon={<EyeOutlined />} onClick={() => navigate(`/assets/${record.id}`)} />
          </Tooltip>
          <Tooltip title="Edit asset">
            <Button icon={<EditOutlined />} onClick={() => navigate(`/assets/${record.id}/edit`)} disabled={!canWrite} />
          </Tooltip>
          <Tooltip title="Delete asset">
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} disabled={!canWrite} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isError) {
    return <AppErrorResult subtitle={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  return (
    <>
      <AppPageHeader
        title="Assets"
        subtitle={`Signed in as ${user?.username ?? 'guest'} — manage inventory, identifiers, and renewal preparation.`}
        actions={
          <>
            <Button icon={<PlusOutlined />} type="primary" onClick={() => navigate('/assets/new')} disabled={!canWrite}>
              New Asset
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => navigate('/renewals/create', { state: { selectedAssetIds: selectedRowKeys, selectedAssets } })}
              disabled={!canWrite || selectedRowKeys.length === 0}
            >
              Create Renewal
            </Button>
          </>
        }
        breadcrumb={[{ title: 'Assets' }]}
      />

      <Card className="page-card">
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Search
              allowClear
              placeholder="Search by item number or name"
              onSearch={setSearch}
              onChange={(event) => setSearch(event.target.value)}
              style={{ maxWidth: 320 }}
              value={search}
            />
            <Select
              value={filterMode}
              style={{ minWidth: 180 }}
              onChange={(value) => setFilterMode(value)}
              options={[
                { value: 'all', label: 'All assets' },
                { value: 'expiring', label: 'Expiring soon' },
              ]}
            />
          </Space>

          <Table
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={filteredAssets}
            pagination={pagination}
            onChange={(nextPagination) => setPagination(nextPagination)}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            rowClassName={(record) => {
              if (record.status === 'renewing') return 'asset-row-renewing';
              if (isExpiringSoon(record.next_billing_date, record.remind_before_days)) return 'asset-row-expiring';
              return '';
            }}
            scroll={{ x: 1200 }}
          />
          <Typography.Text type="secondary">
            Selected assets for renewal: {selectedRowKeys.length}
          </Typography.Text>
        </Space>
      </Card>
    </>
  );
}
