import type { AssetRecord } from './asset';

export interface RenewalItemRecord {
  id: number;
  renewal_id: number;
  asset_id: number;
  new_supplier_id?: number | null;
  new_expiry_date?: string | null;
  new_cost?: number;
}

export interface RenewalRecord {
  id: number;
  renewal_no: string;
  status: 'pending' | 'completed';
  created_at?: string;
  updated_at?: string;
  items?: RenewalItemRecord[];
}

export interface CreateRenewalPayload {
  renewal_no: string;
  asset_ids: number[];
}

export interface CompleteRenewalPayloadItem {
  asset_id: number;
  new_supplier_id?: number;
  new_cost: number;
  new_date: string;
}

export interface CompleteRenewalPayload {
  renewal_id: number;
  items: CompleteRenewalPayloadItem[];
}

export interface RenewalDraftItem {
  asset: AssetRecord;
  asset_id: number;
  new_supplier_id?: number;
  new_cost?: number;
  new_expiry_date?: string;
  new_next_billing_date?: string;
}

export interface RenewalDraft {
  renewal_id: number;
  renewal_no: string;
  items: RenewalDraftItem[];
}
