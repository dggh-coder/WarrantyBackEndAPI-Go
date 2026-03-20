import api, { unwrapRequiredData } from './api';
import type { UserProfile } from '../types/auth';

const FALLBACK_USER: UserProfile = {
  username: 'local-admin',
  role: 'write',
};

export async function fetchCurrentUser(): Promise<UserProfile> {
  try {
    const response = await api.get('/api/me');
    const profile = unwrapRequiredData<UserProfile>(response.data, 'current user');
    return {
      username: profile.username,
      role: profile.role,
    };
  } catch {
    return FALLBACK_USER;
  }
}
