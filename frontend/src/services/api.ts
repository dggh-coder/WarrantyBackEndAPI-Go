import axios from 'axios';
import type { ApiEnvelope } from '../types/api';

function resolveApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return '';
  }

  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }

  return 'http://localhost:8080';
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export function unwrapData<T>(payload: ApiEnvelope<T> | T | null | undefined): T | null | undefined {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T | null | undefined;
}

export function unwrapListData<T>(payload: ApiEnvelope<T[]> | T[] | null | undefined): T[] {
  const data = unwrapData<T[]>(payload);
  return Array.isArray(data) ? data : [];
}

export function unwrapRequiredData<T>(payload: ApiEnvelope<T> | T | null | undefined, resourceLabel: string): T {
  const data = unwrapData<T>(payload);
  if (data === null || data === undefined) {
    throw new Error(`${resourceLabel} response was empty`);
  }

  return data;
}

export default api;
