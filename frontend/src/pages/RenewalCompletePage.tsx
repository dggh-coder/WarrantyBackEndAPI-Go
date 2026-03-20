import { SaveOutlined } from '@ant-design/icons';
import { Alert, Button, Card, DatePicker, Form, InputNumber, Select, Space, Table, Typography, App as AntdApp } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '../components/AppPageHeader';
import AssetStatusTag from '../components/AssetStatusTag';
import { useAuth } from '../hooks/useAuth';
import { useMasterRecords } from '../hooks/useMasters';
import { useRenewalDraft } from '../hooks/useRenewalDraft';
import { completeRenewal } from '../services/renewals';
import type { RenewalDraftItem } from '../types/renewal';
import { formatDate } from '../utils/date';
import { getErrorMessage } from '../utils/error';

interface RenewalCompleteRow extends RenewalDraftItem {
  key: number;
}

export default function RenewalCompletePage() {
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const { canWrite } = useAuth();
  const { draft, clearDraft, saveDraft } = useRenewalDraft();
  const suppliersQuery = useMasterRecords('suppliers');
  const [form] = Form.useForm<{ items: RenewalCompleteRow[] }>();

  const dataSource = useMemo<RenewalCompleteRow[]>(() => {
    return (draft?.items ?? []).map((item) => ({
      ...item,
      key: item.asset_id,
    }));
  }, [draft]);

  const columns: ColumnsType<RenewalCompleteRow> = [
    {
      title: 'Item Number',
      render: (_, record) => record.asset.item_number,
      fixed: 'left',
      width: 140,
    },
    {
      title: 'Name',
      render: (_, record) => record.asset.name || '-',
      width: 180,
    },
    {
      title: 'Current Status',
      render: (_, record) => <AssetStatusTag status={record.asset.status} />,
      width: 120,
    },
    {
      title: 'New Supplier',
      width: 220,
      render: (_, __, index) => (
        <Form.Item name={['items', index, 'new_supplier_id']} style={{ marginBottom: 0 }}>
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            options={(suppliersQuery.data ?? []).map((supplier) => ({ label: supplier.name, value: supplier.id }))}
            disabled={!canWrite}
          />
        </Form.Item>
      ),
    },
    {
      title: 'New Cost',
      width: 160,
      render: (_, __, index) => (
        <Form.Item
          name={['items', index, 'new_cost']}
          rules={[{ required: true, message: 'Required' }]}
          style={{ marginBottom: 0 }}
        >
          <InputNumber min={0} style={{ width: '100%' }} disabled={!canWrite} />
        </Form.Item>
      ),
    },
    {
      title: 'New Expiry Date',
      width: 180,
      render: (_, __, index) => (
        <Form.Item
          name={['items', index, 'new_expiry_date']}
          rules={[{ required: true, message: 'Required' }]}
          style={{ marginBottom: 0 }}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabled={!canWrite}
            onChange={(date) => {
              form.setFieldValue(['items', index, 'new_next_billing_date'], date);
            }}
          />
        </Form.Item>
      ),
    },
    {
      title: 'New Next Billing Date',
      width: 200,
      render: (_, __, index) => (
        <Form.Item
          name={['items', index, 'new_next_billing_date']}
          rules={[{ required: true, message: 'Required' }]}
          style={{ marginBottom: 0 }}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabled={!canWrite}
            onChange={(date) => {
              form.setFieldValue(['items', index, 'new_expiry_date'], date);
            }}
          />
        </Form.Item>
      ),
    },
  ];

  const handleSubmit = async (values: { items: RenewalCompleteRow[] }) => {
    if (!draft) return;

    const items = values.items.map((item) => {
      const syncedDate = item.new_next_billing_date ?? item.new_expiry_date;
      return {
        asset_id: item.asset_id,
        new_supplier_id: item.new_supplier_id,
        new_cost: Number(item.new_cost ?? 0),
        new_date: dayjs(syncedDate).format('YYYY-MM-DD'),
      };
    });

    try {
      await completeRenewal({
        renewal_id: draft.renewal_id,
        items,
      });
      clearDraft();
      message.success('Renewal completed successfully.');
      navigate('/assets');
    } catch (submitError) {
      message.error(getErrorMessage(submitError));
    }
  };

  if (!draft) {
    return (
      <Card>
        <Alert
          type="info"
          showIcon
          message="No pending renewal draft found"
          description="Complete Phase 1 first, then return here to submit the renewal completion details."
          action={<Button onClick={() => navigate('/renewals/create')}>Go to Phase 1</Button>}
        />
      </Card>
    );
  }

  return (
    <>
      <AppPageHeader
        title={`Complete Renewal ${draft.renewal_no}`}
        subtitle="Phase 2 updates the renewed supplier, billing date, and yearly cost for each selected asset."
        breadcrumb={[{ title: 'Renewals' }, { title: 'Phase 2' }]}
      />

      <Card className="page-card">
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Alert
            type="warning"
            showIcon
            message="Backend note"
            description="The current backend completion API stores a single date field and uses it for both expiry and next billing date. This UI keeps both date inputs synchronized to match the API contract."
          />

          <Typography.Text>
            Renewal ID: <strong>{draft.renewal_id}</strong>
          </Typography.Text>
          <Typography.Text>
            Assets in draft: <strong>{draft.items.length}</strong>
          </Typography.Text>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              items: dataSource.map((item) => ({
                ...item,
                new_expiry_date: item.new_expiry_date ? dayjs(item.new_expiry_date) : undefined,
                new_next_billing_date: item.new_next_billing_date ? dayjs(item.new_next_billing_date) : undefined,
              })),
            }}
            onValuesChange={(_, allValues) => {
              saveDraft({
                ...draft,
                items: (allValues.items ?? []).map((item: RenewalCompleteRow) => ({
                  ...item,
                  new_expiry_date: item.new_expiry_date ? dayjs(item.new_expiry_date).format('YYYY-MM-DD') : undefined,
                  new_next_billing_date: item.new_next_billing_date ? dayjs(item.new_next_billing_date).format('YYYY-MM-DD') : undefined,
                })),
              });
            }}
            onFinish={handleSubmit}
          >
            <Table
              rowKey="key"
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              loading={suppliersQuery.isLoading}
              scroll={{ x: 1200 }}
            />
            <Space style={{ marginTop: 16 }}>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} disabled={!canWrite}>
                Submit Renewal Completion
              </Button>
              <Button onClick={() => navigate('/renewals/create')}>Back to Phase 1</Button>
              <Button onClick={clearDraft}>Clear Draft</Button>
            </Space>
          </Form>

          <Typography.Text type="secondary">
            Current synced billing preview: {draft.items.map((item) => `${item.asset.item_number}: ${formatDate(item.new_next_billing_date)}`).join(' · ')}
          </Typography.Text>
        </Space>
      </Card>
    </>
  );
}
