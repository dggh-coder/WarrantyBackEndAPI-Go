import api, { unwrapData } from './api';
import type { CompleteRenewalPayload, CreateRenewalPayload, RenewalRecord } from '../types/renewal';

export async function createRenewal(payload: CreateRenewalPayload): Promise<RenewalRecord> {
  const response = await api.post('/api/renewals', payload);
  return unwrapData<RenewalRecord>(response.data);
}

export async function completeRenewal(payload: CompleteRenewalPayload): Promise<RenewalRecord> {
  const response = await api.post('/api/renewals/complete', payload);
  return unwrapData<RenewalRecord>(response.data);
}
