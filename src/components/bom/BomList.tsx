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
  import { BOM } from "@/types";
  import { useBom } from "@/hooks/useBom";
  import { useItems } from "@/hooks/useItems";
  import { useState } from "react";
  import { BomForm } from "./BomForm";
  
  type BomListProps = {
    boms: BOM[];
    isLoading?: boolean;
  };
  
  export const BomList = ({ boms, isLoading }: BomListProps) => {
    const { deleteBom } = useBom();
    const { items } = useItems();
    const [editingBom, setEditingBom] = useState<BOM | null>(null);
  
    if (isLoading) {
      return <div>Loading BOMs...</div>;
    }
  
    const getItemName = (id: number) => {
      return items.find(item => item.id === id)?.internal_item_name || 'Unknown Item';
    };
  
    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boms.map((bom) => (
              <TableRow key={bom.id}>
                <TableCell>{getItemName(bom.item_id)}</TableCell>
                <TableCell>{getItemName(bom.component_id)}</TableCell>
                <TableCell>{bom.quantity}</TableCell>
                <TableCell>{bom.created_by}</TableCell>
                <TableCell>{new Date(bom.updatedAt || '').toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingBom(bom)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => bom.id && deleteBom(bom.id)}
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
  
        {editingBom && (
          <BomForm 
            bom={editingBom}
            onClose={() => setEditingBom(null)}
          />
        )}
      </>
    );
  };