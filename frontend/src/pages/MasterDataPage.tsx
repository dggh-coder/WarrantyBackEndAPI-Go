import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Space, Table, Typography, App as AntdApp } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppErrorResult from '../components/AppErrorResult';
import AppPageHeader from '../components/AppPageHeader';
import MasterDataModalForm from '../components/MasterDataModalForm';
import { useAuth } from '../hooks/useAuth';
import {
  useCreateMasterRecord,
  useDeleteMasterRecord,
  useMasterRecords,
  useUpdateMasterRecord,
} from '../hooks/useMasters';
import type { MasterRecord, MasterResource } from '../types/master';
import { getErrorMessage } from '../utils/error';

const MASTER_META: Record<MasterResource, { title: string; singular: string }> = {
  categories: { title: 'Categories', singular: 'Category' },
  locations: { title: 'Locations', singular: 'Location' },
  suppliers: { title: 'Suppliers', singular: 'Supplier' },
  units: { title: 'Units', singular: 'Unit' },
};

export default function MasterDataPage() {
  const { resource } = useParams<{ resource: MasterResource }>();
  const { modal, message } = AntdApp.useApp();
  const { canWrite } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null);

  const resolvedResource = (resource ?? 'categories') as MasterResource;
  const meta = MASTER_META[resolvedResource];

  const listQuery = useMasterRecords(resolvedResource);
  const createMutation = useCreateMasterRecord(resolvedResource);
  const updateMutation = useUpdateMasterRecord(resolvedResource);
  const deleteMutation = useDeleteMasterRecord(resolvedResource);

  const columns = useMemo<ColumnsType<MasterRecord>>(
    () => [
      { title: 'ID', dataIndex: 'id', width: 80 },
      { title: 'Name', dataIndex: 'name' },
      {
        title: 'Actions',
        width: 220,
        render: (_, record) => (
          <Space>
            <Button onClick={() => { setEditingRecord(record); setOpen(true); }} disabled={!canWrite}>Edit</Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={!canWrite}
              onClick={() => {
                modal.confirm({
                  title: `Delete ${record.name}?`,
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      await deleteMutation.mutateAsync(record.id);
                      message.success(`${meta.singular} deleted`);
                    } catch (deleteError) {
                      message.error(getErrorMessage(deleteError));
                    }
                  },
                });
              }}
            >
              Delete
            </Button>
          </Space>
        ),
      },
    ],
    [canWrite, deleteMutation, meta.singular, modal, message],
  );

  if (listQuery.isError) {
    return <AppErrorResult subtitle={getErrorMessage(listQuery.error)} onRetry={() => void listQuery.refetch()} />;
  }

  return (
    <>
      <AppPageHeader
        title={meta.title}
        subtitle={`Manage ${meta.title.toLowerCase()} used across asset forms and renewal workflows.`}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingRecord(null); setOpen(true); }} disabled={!canWrite}>
            New {meta.singular}
          </Button>
        }
        breadcrumb={[{ title: 'Master Data' }, { title: meta.title }]}
      />

      <Card className="page-card">
        <Table rowKey="id" loading={listQuery.isLoading} dataSource={listQuery.data ?? []} columns={columns} pagination={{ pageSize: 10 }} />
        <Typography.Text type="secondary">
          All values are fetched live from the backend. No dropdown values are hardcoded.
        </Typography.Text>
      </Card>

      <MasterDataModalForm
        open={open}
        title={editingRecord ? `Edit ${meta.singular}` : `Create ${meta.singular}`}
        record={editingRecord}
        loading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => setOpen(false)}
        onSubmit={async (values) => {
          try {
            if (editingRecord) {
              await updateMutation.mutateAsync({ id: editingRecord.id, payload: values });
              message.success(`${meta.singular} updated`);
            } else {
              await createMutation.mutateAsync(values);
              message.success(`${meta.singular} created`);
            }
            setOpen(false);
          } catch (submitError) {
            message.error(getErrorMessage(submitError));
          }
        }}
      />
    </>
  );
}
