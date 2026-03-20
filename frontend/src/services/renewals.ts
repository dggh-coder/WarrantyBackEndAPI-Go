import api, { unwrapRequiredData } from './api';
import type { CompleteRenewalPayload, CreateRenewalPayload, RenewalRecord } from '../types/renewal';

export async function createRenewal(payload: CreateRenewalPayload): Promise<RenewalRecord> {
  const response = await api.post('/api/renewals', payload);
  return unwrapRequiredData<RenewalRecord>(response.data, 'renewal create');
}

export async function completeRenewal(payload: CompleteRenewalPayload): Promise<RenewalRecord> {
  const response = await api.post('/api/renewals/complete', payload);
  return unwrapRequiredData<RenewalRecord>(response.data, 'renewal completion');
}
