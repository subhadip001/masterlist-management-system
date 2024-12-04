// src/hooks/useBom.ts
import { BOM } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";

export const useBom = () => {
  const queryClient = useQueryClient();

  const bomsQuery = useQuery({
    queryKey: ["boms"],
    queryFn: () => api.get<BOM[]>(endpoints.bom.list).then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (bom: Omit<BOM, "id">) =>
      api.post<BOM>(endpoints.bom.create, bom).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boms"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (bom: BOM) =>
      api.put<BOM>(endpoints.bom.update(bom.id!), bom).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boms"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api.delete(endpoints.bom.delete(id)).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boms"] });
    },
  });

  return {
    boms: bomsQuery.data ?? [],
    isLoading: bomsQuery.isLoading,
    error: bomsQuery.error,
    createBom: createMutation.mutate,
    updateBom: updateMutation.mutate,
    deleteBom: deleteMutation.mutate,
  };
};
