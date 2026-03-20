import { MinusCircleOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  App as AntdApp,
} from 'antd';
import type { Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppErrorResult from '../components/AppErrorResult';
import AppPageHeader from '../components/AppPageHeader';
import { useAsset, useCreateAsset, useUpdateAsset } from '../hooks/useAssets';
import { useAuth } from '../hooks/useAuth';
import { useMasterRecords } from '../hooks/useMasters';
import type { AssetFormValues } from '../types/asset';
import type { MasterResource } from '../types/master';
import { toApiDate, toDayjs } from '../utils/date';
import { getErrorMessage } from '../utils/error';

interface AssetFormPageProps {
  mode: 'create' | 'edit';
}

interface AssetFormUiValues extends Omit<AssetFormValues, 'next_billing_date' | 'expiry_date' | 'commission_date'> {
  next_billing_date: Dayjs;
  expiry_date?: Dayjs;
  commission_date?: Dayjs;
}

const MASTER_CONFIG: { resource: MasterResource; label: string; field: keyof AssetFormValues }[] = [
  { resource: 'categories', label: 'Category', field: 'category_id' },
  { resource: 'locations', label: 'Location', field: 'location_id' },
  { resource: 'suppliers', label: 'Supplier', field: 'supplier_id' },
  { resource: 'units', label: 'Unit', field: 'unit_id' },
];

export default function AssetFormPage({ mode }: AssetFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<AssetFormUiValues>();
  const { canWrite } = useAuth();
  const assetQuery = useAsset(mode === 'edit' ? id : undefined);
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset(id ?? '');

  const masterQueries = {
    categories: useMasterRecords('categories'),
    locations: useMasterRecords('locations'),
    suppliers: useMasterRecords('suppliers'),
    units: useMasterRecords('units'),
  };

  useEffect(() => {
    if (assetQuery.data) {
      form.setFieldsValue({
        item_number: assetQuery.data.item_number,
        name: assetQuery.data.name,
        quantity: assetQuery.data.quantity,
        unit_id: assetQuery.data.unit_id ?? undefined,
        category_id: assetQuery.data.category_id ?? undefined,
        location_id: assetQuery.data.location_id ?? undefined,
        supplier_id: assetQuery.data.supplier_id ?? undefined,
        usage: assetQuery.data.usage,
        description: assetQuery.data.description,
        next_billing_date: toDayjs(assetQuery.data.next_billing_date) ?? undefined,
        remind_before_days: assetQuery.data.remind_before_days,
        expiry_date: toDayjs(assetQuery.data.expiry_date ?? undefined) ?? undefined,
        yearly_cost: assetQuery.data.yearly_cost,
        price: assetQuery.data.price,
        in_use: assetQuery.data.in_use,
        commission_date: toDayjs(assetQuery.data.commission_date ?? undefined) ?? undefined,
        commission_ip: assetQuery.data.commission_ip,
        recent_ip: assetQuery.data.recent_ip,
        status: assetQuery.data.status,
        sns: assetQuery.data.sns?.length
          ? assetQuery.data.sns.map((sn) => ({ sn_value: sn.sn_value, remarks: sn.remarks ?? '' }))
          : [{ sn_value: '', remarks: '' }],
      });
    }
  }, [assetQuery.data, form]);

  const isLoadingMasters = Object.values(masterQueries).some((query) => query.isLoading);
  const isErrorMasters = Object.values(masterQueries).find((query) => query.isError);

  if (mode === 'edit' && assetQuery.isError) {
    return <AppErrorResult subtitle={getErrorMessage(assetQuery.error)} onRetry={() => void assetQuery.refetch()} />;
  }

  if (isErrorMasters) {
    return <AppErrorResult subtitle={getErrorMessage(isErrorMasters.error)} />;
  }

  const handleFinish = async (values: AssetFormUiValues) => {
    const payload: AssetFormValues = {
      ...values,
      next_billing_date: toApiDate(values.next_billing_date) ?? '',
      expiry_date: toApiDate(values.expiry_date),
      commission_date: toApiDate(values.commission_date),
      sns: values.sns ?? [],
    };

    try {
      const savedAsset = mode === 'create'
        ? await createMutation.mutateAsync(payload)
        : await updateMutation.mutateAsync(payload);

      message.success(mode === 'create' ? 'Asset created successfully' : 'Asset updated successfully');
      navigate(`/assets/${savedAsset.id}`);
    } catch (submitError) {
      message.error(getErrorMessage(submitError));
    }
  };

  return (
    <>
      <AppPageHeader
        title={mode === 'create' ? 'Create Asset' : 'Edit Asset'}
        subtitle="Use validated form input and dynamic SN identifiers to keep asset records consistent."
        breadcrumb={[
          { title: 'Assets' },
          { title: mode === 'create' ? 'Create' : `Edit #${id}` },
        ]}
      />

      <Card className="page-card" loading={assetQuery.isLoading || isLoadingMasters}>
        <Form<AssetFormUiValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            quantity: 1,
            remind_before_days: 90,
            in_use: false,
            status: 'active',
            sns: [{ sn_value: '', remarks: '' }],
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Item Number" name="item_number" rules={[{ required: true }, { max: 100 }]}>
                <Input placeholder="e.g. ITM-001" disabled={!canWrite} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Name" name="name" rules={[{ max: 255 }]}>
                <Input placeholder="Asset name" disabled={!canWrite} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {MASTER_CONFIG.map(({ resource, label, field }) => (
              <Col xs={24} md={12} lg={6} key={resource}>
                <Form.Item label={label} name={field}>
                  <Select
                    allowClear
                    showSearch
                    placeholder={`Select ${label.toLowerCase()}`}
                    optionFilterProp="label"
                    disabled={!canWrite}
                    options={(masterQueries[resource].data ?? []).map((record) => ({ label: record.name, value: record.id }))}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} disabled={!canWrite} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Usage" name="usage" rules={[{ max: 255 }]}>
                <Input placeholder="Production / Internal" disabled={!canWrite} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                <Select
                  disabled={!canWrite}
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Renewing', value: 'renewing' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={4} placeholder="Describe the asset" disabled={!canWrite} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Next Billing Date" name="next_billing_date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} disabled={!canWrite} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Remind Before Days" name="remind_before_days" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} disabled={!canWrite} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Expiry Date" name="expiry_date">
                <DatePicker style={{ width: '100%' }} disabled={!canWrite} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Yearly Cost" name="yearly_cost">
                <InputNumber min={0} style={{ width: '100%' }} disabled={!canWrite} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Price" name="price">
                <InputNumber min={0} style={{ width: '100%' }} disabled={!canWrite} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="In Use" name="in_use" valuePropName="checked">
                <Checkbox disabled={!canWrite}>This asset is currently in use</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Commission Date" name="commission_date">
                <DatePicker style={{ width: '100%' }} disabled={!canWrite} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Commission IP" name="commission_ip" rules={[{ max: 45 }]}>
                <Input placeholder="e.g. 10.0.0.10" disabled={!canWrite} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Recent IP" name="recent_ip" rules={[{ max: 45 }]}>
                <Input placeholder="e.g. 10.0.0.15" disabled={!canWrite} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Typography.Title level={5} className="form-section-title">
            Asset Identifiers (SN / PO / License)
          </Typography.Title>
          <Form.List name="sns">
            {(fields, { add, remove }) => (
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                {fields.map((field) => (
                  <div className="sn-list-row" key={field.key}>
                    <Form.Item
                      label="SN Value"
                      name={[field.name, 'sn_value']}
                      rules={[{ required: true, message: 'Please enter an identifier' }, { max: 255 }]}
                    >
                      <Input placeholder="Serial / PO / License" disabled={!canWrite} />
                    </Form.Item>
                    <Form.Item label="Remarks" name={[field.name, 'remarks']} rules={[{ max: 255 }]}>
                      <Input placeholder="Optional remarks" disabled={!canWrite} />
                    </Form.Item>
                    <Button
                      danger
                      icon={<MinusCircleOutlined />}
                      style={{ alignSelf: 'end' }}
                      onClick={() => remove(field.name)}
                      disabled={!canWrite || fields.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button icon={<PlusOutlined />} onClick={() => add({ sn_value: '', remarks: '' })} disabled={!canWrite}>
                  Add Identifier
                </Button>
              </Space>
            )}
          </Form.List>

          <Divider />
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={createMutation.isPending || updateMutation.isPending} disabled={!canWrite}>
              {mode === 'create' ? 'Create Asset' : 'Save Changes'}
            </Button>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </>
  );
}
