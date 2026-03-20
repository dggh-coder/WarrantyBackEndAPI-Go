import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAsset, deleteAsset, getAsset, getAssets, updateAsset } from '../services/assets';
import type { AssetFormValues } from '../types/asset';

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: getAssets,
  });
}

export function useAsset(id?: string) {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: () => getAsset(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssetFormValues) => createAsset(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useUpdateAsset(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssetFormValues) => updateAsset(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['assets'] });
      void queryClient.invalidateQueries({ queryKey: ['assets', id] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
