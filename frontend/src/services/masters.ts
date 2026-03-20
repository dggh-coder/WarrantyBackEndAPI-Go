import api, { unwrapData } from './api';
import type { MasterRecord, MasterResource } from '../types/master';

export async function getMasterRecords(resource: MasterResource): Promise<MasterRecord[]> {
  const response = await api.get(`/api/${resource}`);
  return unwrapData<MasterRecord[]>(response.data);
}

export async function createMasterRecord(resource: MasterResource, payload: { name: string }): Promise<MasterRecord> {
  const response = await api.post(`/api/${resource}`, payload);
  return unwrapData<MasterRecord>(response.data);
}

export async function updateMasterRecord(resource: MasterResource, id: number, payload: { name: string }): Promise<MasterRecord> {
  const response = await api.put(`/api/${resource}/${id}`, payload);
  return unwrapData<MasterRecord>(response.data);
}

export async function deleteMasterRecord(resource: MasterResource, id: number): Promise<void> {
  await api.delete(`/api/${resource}/${id}`);
}
