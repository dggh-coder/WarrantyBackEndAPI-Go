import type { MasterRecord } from './master';

export interface AssetSn {
  id?: number;
  asset_id?: number;
  sn_value: string;
  remarks?: string;
}

export interface AssetRecord {
  id: number;
  item_number: string;
  name: string;
  quantity: number;
  unit_id?: number | null;
  category_id?: number | null;
  location_id?: number | null;
  supplier_id?: number | null;
  usage?: string;
  description?: string;
  next_billing_date: string;
  remind_before_days: number;
  expiry_date?: string | null;
  yearly_cost?: number;
  price?: number;
  in_use: boolean;
  commission_date?: string | null;
  commission_ip?: string;
  recent_ip?: string;
  status: 'active' | 'renewing';
  created_at?: string;
  updated_at?: string;
  unit?: MasterRecord;
  category?: MasterRecord;
  location?: MasterRecord;
  supplier?: MasterRecord;
  sns?: AssetSn[];
}

export interface AssetFormValues {
  item_number: string;
  name?: string;
  quantity: number;
  unit_id?: number;
  category_id?: number;
  location_id?: number;
  supplier_id?: number;
  usage?: string;
  description?: string;
  next_billing_date: string;
  remind_before_days: number;
  expiry_date?: string;
  yearly_cost?: number;
  price?: number;
  in_use: boolean;
  commission_date?: string;
  commission_ip?: string;
  recent_ip?: string;
  status?: 'active' | 'renewing';
  sns: AssetSn[];
}
