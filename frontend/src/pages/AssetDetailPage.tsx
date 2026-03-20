import { EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Empty, List, Space, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import AppErrorResult from '../components/AppErrorResult';
import AppPageHeader from '../components/AppPageHeader';
import AssetStatusTag from '../components/AssetStatusTag';
import { useAsset } from '../hooks/useAssets';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/date';
import { getErrorMessage } from '../utils/error';

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const { data: asset, isLoading, isError, error, refetch } = useAsset(id);

  if (isError) {
    return <AppErrorResult subtitle={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  return (
    <>
      <AppPageHeader
        title={asset?.item_number ?? 'Asset Detail'}
        subtitle={asset?.name ?? 'Inspect the full asset record, linked identifiers, and lifecycle status.'}
        actions={
          <>
            <Button icon={<EditOutlined />} onClick={() => navigate(`/assets/${id}/edit`)} disabled={!canWrite}>
              Edit Asset
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => navigate('/renewals/create', { state: { selectedAssetIds: asset ? [asset.id] : [], selectedAssets: asset ? [asset] : [] } })}
              disabled={!canWrite || !asset}
            >
              Start Renewal
            </Button>
          </>
        }
        breadcrumb={[{ title: 'Assets' }, { title: asset?.item_number ?? `Asset #${id}` }]}
      />

      <Card className="page-card" loading={isLoading}>
        {asset ? (
          <Descriptions bordered column={1} className="detail-grid">
            <Descriptions.Item label="Item Number">{asset.item_number}</Descriptions.Item>
            <Descriptions.Item label="Name">{asset.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <AssetStatusTag status={asset.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Category">{asset.category?.name ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Location">{asset.location?.name ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Supplier">{asset.supplier?.name ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Unit">{asset.unit?.name ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Quantity">{asset.quantity}</Descriptions.Item>
            <Descriptions.Item label="Usage">{asset.usage || '-'}</Descriptions.Item>
            <Descriptions.Item label="Description">
              <Typography.Paragraph className="asset-description">{asset.description || '-'}</Typography.Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="Next Billing Date">{formatDate(asset.next_billing_date)}</Descriptions.Item>
            <Descriptions.Item label="Remind Before Days">{asset.remind_before_days}</Descriptions.Item>
            <Descriptions.Item label="Expiry Date">{formatDate(asset.expiry_date)}</Descriptions.Item>
            <Descriptions.Item label="Yearly Cost">{asset.yearly_cost ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Price">{asset.price ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="In Use">{asset.in_use ? 'Yes' : 'No'}</Descriptions.Item>
            <Descriptions.Item label="Commission Date">{formatDate(asset.commission_date)}</Descriptions.Item>
            <Descriptions.Item label="Commission IP">{asset.commission_ip || '-'}</Descriptions.Item>
            <Descriptions.Item label="Recent IP">{asset.recent_ip || '-'}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Card>

      <Card className="page-card" title="Identifiers">
        {asset?.sns?.length ? (
          <List
            dataSource={asset.sns}
            renderItem={(sn) => (
              <List.Item>
                <Space direction="vertical" size={0}>
                  <Typography.Text strong>{sn.sn_value}</Typography.Text>
                  <Typography.Text type="secondary">{sn.remarks || 'No remarks'}</Typography.Text>
                </Space>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No identifiers linked to this asset" />
        )}
      </Card>
    </>
  );
}
