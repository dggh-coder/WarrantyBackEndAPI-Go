import api, { unwrapListData, unwrapRequiredData } from './api';
import type { AssetFormValues, AssetRecord, AssetSn } from '../types/asset';

function sanitizeSnList(sns: AssetSn[]): AssetSn[] {
  return sns
    .filter((sn) => sn.sn_value?.trim())
    .map((sn) => ({
      sn_value: sn.sn_value.trim(),
      remarks: sn.remarks?.trim() ?? '',
    }));
}

export async function getAssets(): Promise<AssetRecord[]> {
  const response = await api.get('/api/assets');
  return unwrapListData<AssetRecord>(response.data);
}

export async function getAsset(id: string): Promise<AssetRecord> {
  const response = await api.get(`/api/assets/${id}`);
  return unwrapRequiredData<AssetRecord>(response.data, 'asset detail');
}

export async function createAsset(payload: AssetFormValues): Promise<AssetRecord> {
  const response = await api.post('/api/assets', {
    ...payload,
    sns: sanitizeSnList(payload.sns),
  });
  return unwrapRequiredData<AssetRecord>(response.data, 'created asset');
}

export async function updateAsset(id: string, payload: AssetFormValues): Promise<AssetRecord> {
  const response = await api.put(`/api/assets/${id}`, {
    ...payload,
    sns: sanitizeSnList(payload.sns),
  });
  return unwrapRequiredData<AssetRecord>(response.data, 'updated asset');
}

export async function deleteAsset(id: number): Promise<void> {
  await api.delete(`/api/assets/${id}`);
}
