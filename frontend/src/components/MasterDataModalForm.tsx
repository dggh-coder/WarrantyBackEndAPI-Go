import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';
import type { MasterRecord } from '../types/master';

interface MasterDataModalFormProps {
  open: boolean;
  title: string;
  record?: MasterRecord | null;
  loading?: boolean;
  onSubmit: (values: { name: string }) => Promise<void> | void;
  onCancel: () => void;
}

export default function MasterDataModalForm({
  open,
  title,
  record,
  loading,
  onSubmit,
  onCancel,
}: MasterDataModalFormProps) {
  const [form] = Form.useForm<{ name: string }>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ name: record?.name ?? '' });
    }
  }, [form, open, record]);

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter a name' },
            { max: 150, message: 'Name must be 150 characters or less' },
          ]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
