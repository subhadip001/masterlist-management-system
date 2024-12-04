import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Item } from "@/types";
import { useItems } from "@/hooks/useItems";
import { useState } from "react";
import { ItemForm } from "./ItemForm";

type ItemListProps = {
  items: Item[];
  isLoading?: boolean;
  isPending?: boolean;
};

export const ItemList = ({ items, isLoading, isPending }: ItemListProps) => {
  const { deleteItem } = useItems();
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  if (isLoading) {
    return <div>Loading items...</div>;
  }

  return (
    <>
      <div className="h-[calc(100vh-14rem)] overflow-y-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>UOM</TableHead>
              <TableHead>Min Buffer</TableHead>
              <TableHead>Max Buffer</TableHead>
              <TableHead>Scrap Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.internal_item_name + index}>
                <TableCell>{item.internal_item_name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.uom}</TableCell>
                <TableCell>{item.min_buffer}</TableCell>
                <TableCell>{item.max_buffer}</TableCell>
                <TableCell>
                  {item.type === "sell"
                    ? item.additional_attributes?.scrap_type || "Not Set"
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingItem(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => item.id && deleteItem(item.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingItem && (
        <ItemForm item={editingItem} onClose={() => setEditingItem(null)} />
      )}
    </>
  );
};
