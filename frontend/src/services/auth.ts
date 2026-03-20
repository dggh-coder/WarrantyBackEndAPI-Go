import api, { unwrapRequiredData } from './api';
import type { AuthState, UserProfile } from '../types/auth';

const FALLBACK_USER: UserProfile = {
  username: 'local-admin',
  role: 'write',
};

export async function fetchCurrentUser(): Promise<AuthState> {
  try {
    const response = await api.get('/api/me');
    const profile = unwrapRequiredData<UserProfile>(response.data, 'current user');
    return {
      user: {
        username: profile.username,
        role: profile.role,
      },
      isFallback: false,
    };
  } catch {
    return {
      user: FALLBACK_USER,
      isFallback: true,
    };
  }
}
