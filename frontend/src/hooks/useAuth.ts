import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '../services/auth';
import type { AuthState, UserProfile } from '../types/auth';

const STORAGE_KEY = 'asset-app-current-user';

function isUserProfile(value: unknown): value is UserProfile {
  return Boolean(
    value
      && typeof value === 'object'
      && 'username' in value
      && typeof (value as UserProfile).username === 'string'
      && 'role' in value
      && ((value as UserProfile).role === 'read' || (value as UserProfile).role === 'write'),
  );
}

function readStoredAuth(): AuthState | undefined {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as AuthState | UserProfile) : undefined;

    if (!parsed) {
      return undefined;
    }

    if (isUserProfile(parsed)) {
      return { user: parsed, isFallback: false };
    }

    if (typeof parsed === 'object' && parsed !== null && 'user' in parsed && isUserProfile(parsed.user)) {
      return {
        user: parsed.user,
        isFallback: Boolean('isFallback' in parsed && parsed.isFallback),
      };
    }

    return undefined;
  } catch {
    return undefined;
  }
}

export function useAuth() {
  const query = useQuery({
    queryKey: ['me'],
    queryFn: fetchCurrentUser,
    initialData: readStoredAuth,
  });

  useEffect(() => {
    if (query.data) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(query.data));
    }
  }, [query.data]);

  return {
    ...query,
    user: query.data?.user,
    isFallback: query.data?.isFallback ?? false,
    canWrite: query.data?.user.role === 'write',
  };
}
