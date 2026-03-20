import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '../services/auth';
import type { UserProfile } from '../types/auth';

const STORAGE_KEY = 'asset-app-current-user';

function readStoredUser(): UserProfile | undefined {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : undefined;
  } catch {
    return undefined;
  }
}

export function useAuth() {
  const query = useQuery({
    queryKey: ['me'],
    queryFn: fetchCurrentUser,
    initialData: readStoredUser,
  });

  useEffect(() => {
    if (query.data) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(query.data));
    }
  }, [query.data]);

  return {
    ...query,
    user: query.data,
    canWrite: query.data?.role === 'write',
  };
}
