import { useMemo } from 'react';
import type { RenewalDraft } from '../types/renewal';

const STORAGE_KEY = 'asset-renewal-draft';

function safeParse(): RenewalDraft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RenewalDraft) : null;
  } catch {
    return null;
  }
}

export function useRenewalDraft() {
  const draft = useMemo(() => safeParse(), []);

  return {
    draft,
    saveDraft(nextDraft: RenewalDraft) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
    },
    clearDraft() {
      window.localStorage.removeItem(STORAGE_KEY);
    },
  };
}
