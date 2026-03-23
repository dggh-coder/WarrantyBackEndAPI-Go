import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Divider, Input, Popover, Select, Space, Table, Tag, Tooltip, Typography, App as AntdApp } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
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
const DEFAULT_COLUMN_STORAGE_PREFIX = 'asset-app-visible-columns';

type AssetColumnKey =
  | 'item_number'
  | 'name'
  | 'quantity'
  | 'unit'
  | 'category'
  | 'location'
  | 'supplier'
  | 'usage'
  | 'description'
  | 'sns'
  | 'next_billing_date'
  | 'remind_before_days'
  | 'expiry_date'
  | 'yearly_cost'
  | 'price'
  | 'in_use'
  | 'commission_date'
  | 'commission_ip'
  | 'recent_ip'
  | 'status'
  | 'created_at'
  | 'updated_at'
  | 'actions';

type AssetColumnConfig = {
  key: AssetColumnKey;
  label: string;
  hideable?: boolean;
  column: ColumnsType<AssetRecord>[number];
};

function formatCurrency(value?: number) {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatBoolean(value: boolean) {
  return value ? 'Yes' : 'No';
}

function getColumnPreferenceStorageKey(username?: string) {
  return `${DEFAULT_COLUMN_STORAGE_PREFIX}:${username ?? 'guest'}`;
}

function readStoredVisibleColumns(username?: string): AssetColumnKey[] | undefined {
  try {
    const raw = window.localStorage.getItem(getColumnPreferenceStorageKey(username));
    return raw ? (JSON.parse(raw) as AssetColumnKey[]) : undefined;
  } catch {
    return undefined;
  }
}

function writeStoredVisibleColumns(username: string | undefined, columnKeys: AssetColumnKey[]) {
  window.localStorage.setItem(getColumnPreferenceStorageKey(username), JSON.stringify(columnKeys));
}

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
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<AssetColumnKey[]>([]);
  const [columnPopoverOpen, setColumnPopoverOpen] = useState(false);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = [
        asset.item_number,
        asset.name,
        asset.description,
        asset.usage,
        asset.commission_ip,
        asset.recent_ip,
        asset.category?.name,
        asset.location?.name,
        asset.supplier?.name,
        asset.unit?.name,
        ...(asset.sns?.map((sn) => sn.sn_value) ?? []),
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search.toLowerCase()));

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

  const columnConfigs = useMemo<AssetColumnConfig[]>(() => [
    {
      key: 'name',
      label: 'Warranty Product',
      column: {
        key: 'name',
        title: 'Warranty Product',
        dataIndex: 'name',
        width: 220,
        fixed: 'left',
        sorter: (a, b) => (a.name ?? '').localeCompare(b.name ?? ''),
        render: (_, record) => record.name || '-',
      },
    },
    {
      key: 'quantity',
      label: 'Qty',
      column: {
        key: 'quantity',
        title: 'Qty',
        dataIndex: 'quantity',
        width: 100,
        sorter: (a, b) => a.quantity - b.quantity,
      },
    },
    {
      key: 'unit',
      label: 'Qty Unit',
      column: {
        key: 'unit',
        title: 'Qty Unit',
        width: 140,
        render: (_, record) => record.unit?.name ?? '-',
        sorter: (a, b) => (a.unit?.name ?? '').localeCompare(b.unit?.name ?? ''),
      },
    },
    {
      key: 'sns',
      label: 'S/N',
      column: {
        key: 'sns',
        title: 'S/N',
        width: 220,
        render: (_, record) => record.sns?.map((sn) => sn.sn_value).join(', ') || '-',
      },
    },
    {
      key: 'usage',
      label: 'Usage',
      column: {
        key: 'usage',
        title: 'Usage',
        dataIndex: 'usage',
        width: 180,
        render: (value) => value || '-',
      },
    },
    {
      key: 'description',
      label: 'Description',
      column: {
        key: 'description',
        title: 'Description',
        dataIndex: 'description',
        width: 220,
        render: (value) => value || '-',
      },
    },
    {
      key: 'location',
      label: 'Location',
      column: {
        key: 'location',
        title: 'Location',
        width: 160,
        render: (_, record) => record.location?.name ?? '-',
        sorter: (a, b) => (a.location?.name ?? '').localeCompare(b.location?.name ?? ''),
      },
    },
    {
      key: 'supplier',
      label: 'Supplier',
      column: {
        key: 'supplier',
        title: 'Supplier',
        width: 160,
        render: (_, record) => record.supplier?.name ?? '-',
        sorter: (a, b) => (a.supplier?.name ?? '').localeCompare(b.supplier?.name ?? ''),
      },
    },
    {
      key: 'expiry_date',
      label: 'Warranty Expire Date',
      column: {
        key: 'expiry_date',
        title: 'Warranty Expire Date',
        dataIndex: 'expiry_date',
        width: 180,
        render: (value) => (value ? formatDate(value) : '-'),
        sorter: (a, b) => (a.expiry_date ?? '').localeCompare(b.expiry_date ?? ''),
      },
    },
    {
      key: 'yearly_cost',
      label: 'Yearly Cost',
      column: {
        key: 'yearly_cost',
        title: 'Yearly Cost',
        dataIndex: 'yearly_cost',
        width: 140,
        render: (value) => formatCurrency(value),
        sorter: (a, b) => (a.yearly_cost ?? 0) - (b.yearly_cost ?? 0),
      },
    },
    {
      key: 'in_use',
      label: 'In Use',
      column: {
        key: 'in_use',
        title: 'In Use',
        dataIndex: 'in_use',
        width: 110,
        render: (value) => formatBoolean(value),
        sorter: (a, b) => Number(a.in_use) - Number(b.in_use),
      },
    },
    {
      key: 'category',
      label: 'Category',
      column: {
        key: 'category',
        title: 'Category',
        width: 160,
        render: (_, record) => record.category?.name ?? '-',
        sorter: (a, b) => (a.category?.name ?? '').localeCompare(b.category?.name ?? ''),
      },
    },
    {
      key: 'commission_date',
      label: 'Commission Date',
      column: {
        key: 'commission_date',
        title: 'Commission Date',
        dataIndex: 'commission_date',
        width: 170,
        render: (value) => (value ? formatDate(value) : '-'),
        sorter: (a, b) => (a.commission_date ?? '').localeCompare(b.commission_date ?? ''),
      },
    },
    {
      key: 'commission_ip',
      label: 'Commision IP',
      column: {
        key: 'commission_ip',
        title: 'Commision IP',
        dataIndex: 'commission_ip',
        width: 160,
        render: (value) => value || '-',
      },
    },
    {
      key: 'recent_ip',
      label: 'Recent IP',
      column: {
        key: 'recent_ip',
        title: 'Recent IP',
        dataIndex: 'recent_ip',
        width: 150,
        render: (value) => value || '-',
      },
    },
    {
      key: 'price',
      label: 'Price',
      column: {
        key: 'price',
        title: 'Price',
        dataIndex: 'price',
        width: 140,
        render: (value) => formatCurrency(value),
        sorter: (a, b) => (a.price ?? 0) - (b.price ?? 0),
      },
    },
    {
      key: 'item_number',
      label: 'Item Number',
      hideable: false,
      column: {
        key: 'item_number',
        title: 'Item Number',
        dataIndex: 'item_number',
        width: 180,
        sorter: (a, b) => a.item_number.localeCompare(b.item_number),
        render: (_, record) => (
          <Button type="link" onClick={() => navigate(`/assets/${record.id}`)} style={{ padding: 0 }}>
            {record.item_number}
          </Button>
        ),
      },
    },
    {
      key: 'next_billing_date',
      label: 'Next Billing Date',
      column: {
        key: 'next_billing_date',
        title: 'Next Billing Date',
        dataIndex: 'next_billing_date',
        width: 170,
        sorter: (a, b) => a.next_billing_date.localeCompare(b.next_billing_date),
        render: (value, record) => (
          <Space>
            <span>{formatDate(value)}</span>
            {isExpiringSoon(record.next_billing_date, record.remind_before_days) ? <Tag color="red">Expiring soon</Tag> : null}
          </Space>
        ),
      },
    },
    {
      key: 'remind_before_days',
      label: 'Remind Before (Days)',
      column: {
        key: 'remind_before_days',
        title: 'Remind Before (Days)',
        dataIndex: 'remind_before_days',
        width: 160,
        sorter: (a, b) => a.remind_before_days - b.remind_before_days,
      },
    },
    {
      key: 'status',
      label: 'Status',
      column: {
        key: 'status',
        title: 'Status',
        dataIndex: 'status',
        width: 130,
        render: (status) => <AssetStatusTag status={status} />,
      },
    },
    {
      key: 'created_at',
      label: 'Created At',
      column: {
        key: 'created_at',
        title: 'Created At',
        dataIndex: 'created_at',
        width: 170,
        render: (value) => (value ? formatDate(value) : '-'),
        sorter: (a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''),
      },
    },
    {
      key: 'updated_at',
      label: 'Updated At',
      column: {
        key: 'updated_at',
        title: 'Updated At',
        dataIndex: 'updated_at',
        width: 170,
        render: (value) => (value ? formatDate(value) : '-'),
        sorter: (a, b) => (a.updated_at ?? '').localeCompare(b.updated_at ?? ''),
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      hideable: false,
      column: {
        key: 'actions',
        title: 'Actions',
        width: 180,
        fixed: 'right',
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
    },
  ], [canWrite, navigate]);

  const defaultVisibleColumnKeys = useMemo(
    () => columnConfigs.map((columnConfig) => columnConfig.key),
    [columnConfigs],
  );

  useEffect(() => {
    const stored = readStoredVisibleColumns(user?.username);
    const allowedKeys = new Set(columnConfigs.map((columnConfig) => columnConfig.key));
    const sanitized = stored?.filter((key) => allowedKeys.has(key));

    if (sanitized && sanitized.length > 0) {
      setVisibleColumnKeys(sanitized);
      return;
    }

    setVisibleColumnKeys(defaultVisibleColumnKeys);
  }, [columnConfigs, defaultVisibleColumnKeys, user?.username]);

  const visibleColumns = useMemo(
    () => columnConfigs.filter((columnConfig) => visibleColumnKeys.includes(columnConfig.key)).map((columnConfig) => columnConfig.column),
    [columnConfigs, visibleColumnKeys],
  );

  const hideableColumnOptions = useMemo(
    () => columnConfigs.filter((columnConfig) => columnConfig.hideable !== false),
    [columnConfigs],
  );

  const hideableVisibleColumnKeys = useMemo(
    () => hideableColumnOptions.map((columnConfig) => columnConfig.key).filter((key) => visibleColumnKeys.includes(key)),
    [hideableColumnOptions, visibleColumnKeys],
  );

  const handleVisibleColumnChange = (nextValues: AssetColumnKey[]) => {
    const selectedHideableKeys = new Set(nextValues);
    const alwaysVisibleKeys = columnConfigs.filter((columnConfig) => columnConfig.hideable === false).map((columnConfig) => columnConfig.key);

    setVisibleColumnKeys([
      ...alwaysVisibleKeys,
      ...hideableColumnOptions.map((columnConfig) => columnConfig.key).filter((key) => selectedHideableKeys.has(key)),
    ]);
  };

  const handleSaveColumnDefaults = () => {
    writeStoredVisibleColumns(user?.username, visibleColumnKeys);
    message.success(`Saved asset column defaults for ${user?.username ?? 'guest'}`);
    setColumnPopoverOpen(false);
  };

  const handleResetColumnDefaults = () => {
    setVisibleColumnKeys(defaultVisibleColumnKeys);
    writeStoredVisibleColumns(user?.username, defaultVisibleColumnKeys);
    message.success(`Reset asset column defaults for ${user?.username ?? 'guest'}`);
    setColumnPopoverOpen(false);
  };

  const columnSettingsContent = (
    <Space direction="vertical" size={12} style={{ minWidth: 260 }}>
      <Typography.Text strong>Visible asset fields</Typography.Text>
      <Checkbox.Group value={hideableVisibleColumnKeys} onChange={handleVisibleColumnChange}>
        <Space direction="vertical" size={8}>
          {hideableColumnOptions.map((columnConfig) => (
            <Checkbox key={columnConfig.key} value={columnConfig.key}>
              {columnConfig.label}
            </Checkbox>
          ))}
        </Space>
      </Checkbox.Group>
      <Divider style={{ margin: '4px 0' }} />
      <Space>
        <Button type="primary" onClick={handleSaveColumnDefaults}>
          Save as default
        </Button>
        <Button onClick={handleResetColumnDefaults}>Reset default</Button>
      </Space>
    </Space>
  );

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
              placeholder="Search by asset information"
              onSearch={setSearch}
              onChange={(event) => setSearch(event.target.value)}
              style={{ maxWidth: 320 }}
              value={search}
            />
            <Space wrap>
              <Select
                value={filterMode}
                style={{ minWidth: 180 }}
                onChange={(value) => setFilterMode(value)}
                options={[
                  { value: 'all', label: 'All assets' },
                  { value: 'expiring', label: 'Expiring soon' },
                ]}
              />
              <Popover
                trigger="click"
                placement="bottomRight"
                content={columnSettingsContent}
                open={columnPopoverOpen}
                onOpenChange={setColumnPopoverOpen}
              >
                <Button icon={<SettingOutlined />}>Columns</Button>
              </Popover>
            </Space>
          </Space>

          <Table
            rowKey="id"
            loading={isLoading}
            columns={visibleColumns}
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
            scroll={{ x: 'max-content', y: 600 }}
            sticky
          />
          <Typography.Text type="secondary">
            Selected assets for renewal: {selectedRowKeys.length}
          </Typography.Text>
        </Space>
      </Card>
    </>
  );
}
