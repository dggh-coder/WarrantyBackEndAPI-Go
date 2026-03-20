import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMasterRecord, deleteMasterRecord, getMasterRecords, updateMasterRecord } from '../services/masters';
import type { MasterResource } from '../types/master';

export function useMasterRecords(resource: MasterResource) {
  return useQuery({
    queryKey: ['masters', resource],
    queryFn: () => getMasterRecords(resource),
  });
}

export function useCreateMasterRecord(resource: MasterResource) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) => createMasterRecord(resource, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['masters', resource] });
      void queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useUpdateMasterRecord(resource: MasterResource) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name: string } }) => updateMasterRecord(resource, id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['masters', resource] });
      void queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useDeleteMasterRecord(resource: MasterResource) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMasterRecord(resource, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['masters', resource] });
      void queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
