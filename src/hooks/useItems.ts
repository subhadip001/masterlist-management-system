import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { Item } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import { useItemStore } from "@/store/itemStore";

export const useItems = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const setItems = useItemStore((state) => state.setItems);

  // Fetch all items
  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await api.get<Item[]>(endpoints.items.list);
      return response.data;
    },
  });

  // Create item
  const createItemMutation = useMutation({
    mutationFn: async (newItem: Omit<Item, "id">) => {
      const response = await api.post<Item>(endpoints.items.create, newItem);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast({
        title: "Success",
        description: "Item created successfully",
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.log("error", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `${error.response?.data.message}.`,
      });
    },
  });

  // Update item
  const updateItemMutation = useMutation({
    mutationFn: async (updatedItem: Item) => {
      const response = await api.put<Item>(
        endpoints.items.update(updatedItem.id!),
        updatedItem
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data.message,
      });
    },
  });

  // Delete item
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await api.delete(endpoints.items.delete(itemId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data.message,
      });
    },
  });

  return {
    items,
    isLoading,
    error,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
  };
};
