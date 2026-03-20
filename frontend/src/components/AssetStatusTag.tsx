import { Tag } from 'antd';
import type { AssetRecord } from '../types/asset';

interface AssetStatusTagProps {
  status: AssetRecord['status'];
}

export default function AssetStatusTag({ status }: AssetStatusTagProps) {
  if (status === 'renewing') {
    return <Tag color="gold">Renewing</Tag>;
  }

  return <Tag color="green">Active</Tag>;
}
