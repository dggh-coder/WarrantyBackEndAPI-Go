import api, { unwrapListData, unwrapRequiredData } from './api';
import type { MasterRecord, MasterResource } from '../types/master';

export async function getMasterRecords(resource: MasterResource): Promise<MasterRecord[]> {
  const response = await api.get(`/api/${resource}`);
  return unwrapListData<MasterRecord>(response.data);
}

export async function createMasterRecord(resource: MasterResource, payload: { name: string }): Promise<MasterRecord> {
  const response = await api.post(`/api/${resource}`, payload);
  return unwrapRequiredData<MasterRecord>(response.data, `${resource} create`);
}

export async function updateMasterRecord(resource: MasterResource, id: number, payload: { name: string }): Promise<MasterRecord> {
  const response = await api.put(`/api/${resource}/${id}`, payload);
  return unwrapRequiredData<MasterRecord>(response.data, `${resource} update`);
}

export async function deleteMasterRecord(resource: MasterResource, id: number): Promise<void> {
  await api.delete(`/api/${resource}/${id}`);
}
