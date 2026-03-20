import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, Table, Typography, App as AntdApp } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppErrorResult from '../components/AppErrorResult';
import AppPageHeader from '../components/AppPageHeader';
import AssetStatusTag from '../components/AssetStatusTag';
import { useAssets } from '../hooks/useAssets';
import { useAuth } from '../hooks/useAuth';
import { useRenewalDraft } from '../hooks/useRenewalDraft';
import { createRenewal } from '../services/renewals';
import type { AssetRecord } from '../types/asset';
import type { RenewalDraft, RenewalDraftItem } from '../types/renewal';
import { formatDate } from '../utils/date';
import { getErrorMessage } from '../utils/error';

interface LocationState {
  selectedAssetIds?: number[];
  selectedAssets?: AssetRecord[];
}

export default function RenewalCreatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const { canWrite } = useAuth();
  const { saveDraft } = useRenewalDraft();
  const [form] = Form.useForm<{ renewal_no: string }>();
  const { data: assets = [], isLoading, isError, error, refetch } = useAssets();
  const state = (location.state as LocationState | null) ?? null;
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>(state?.selectedAssetIds ?? []);
  const [submitting, setSubmitting] = useState(false);

  const selectedAssets = useMemo(
    () => assets.filter((asset) => selectedAssetIds.includes(asset.id)),
    [assets, selectedAssetIds],
  );

  const columns: ColumnsType<AssetRecord> = [
    { title: 'Item Number', dataIndex: 'item_number' },
    { title: 'Name', dataIndex: 'name', render: (value) => value || '-' },
    { title: 'Supplier', render: (_, record) => record.supplier?.name ?? '-' },
    { title: 'Next Billing Date', dataIndex: 'next_billing_date', render: (value) => formatDate(value) },
    { title: 'Status', dataIndex: 'status', render: (value) => <AssetStatusTag status={value} /> },
  ];

  const handleSubmit = async (values: { renewal_no: string }) => {
    setSubmitting(true);
    try {
      const renewal = await createRenewal({
        renewal_no: values.renewal_no,
        asset_ids: selectedAssetIds,
      });

      const items: RenewalDraftItem[] = selectedAssets.map((asset) => ({
        asset,
        asset_id: asset.id,
        new_supplier_id: asset.supplier_id ?? undefined,
        new_cost: asset.yearly_cost ?? 0,
        new_expiry_date: asset.expiry_date ?? asset.next_billing_date,
        new_next_billing_date: asset.expiry_date ?? asset.next_billing_date,
      }));

      const draft: RenewalDraft = {
        renewal_id: renewal.id,
        renewal_no: renewal.renewal_no,
        items,
      };

      saveDraft(draft);
      message.success('Renewal created. Continue with completion details.');
      navigate('/renewals/complete');
    } catch (submitError) {
      message.error(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  if (isError) {
    return <AppErrorResult subtitle={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  return (
    <>
      <AppPageHeader
        title="Create Renewal"
        subtitle="Select the assets that enter the renewal workflow and assign a renewal number."
        breadcrumb={[{ title: 'Renewals' }, { title: 'Phase 1' }]}
      />

      <Card className="page-card">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Form.Item
              label="Renewal Number"
              name="renewal_no"
              rules={[{ required: true, message: 'Please input renewal number' }, { max: 100 }]}
            >
              <Input placeholder="e.g. IP-001" disabled={!canWrite} />
            </Form.Item>

            <Table
              rowKey="id"
              loading={isLoading}
              columns={columns}
              dataSource={assets}
              pagination={{ pageSize: 10 }}
              rowSelection={{
                selectedRowKeys: selectedAssetIds,
                onChange: (keys) => setSelectedAssetIds(keys.map((key) => Number(key))),
              }}
              scroll={{ x: 900 }}
            />

            <Typography.Text type="secondary">Selected assets: {selectedAssetIds.length}</Typography.Text>

            <Space>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={submitting} disabled={!canWrite || selectedAssetIds.length === 0}>
                Create Renewal
              </Button>
              <Button onClick={() => navigate('/assets')}>Back to Assets</Button>
            </Space>
          </Space>
        </Form>
      </Card>
    </>
  );
}
