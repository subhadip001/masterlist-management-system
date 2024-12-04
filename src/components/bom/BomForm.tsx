import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BOM, Item } from "@/types";
import { useBom } from "@/hooks/useBom";
import { useItems } from "@/hooks/useItems";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormError } from "@/components/form-error";

type BomFormProps = {
  bom?: BOM;
  onClose: () => void;
};

const defaultBom: Omit<BOM, "id"> = {
  item_id: 0,
  component_id: 0,
  quantity: 1,
  created_by: "system_user",
  last_updated_by: "system_user",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const BomForm = ({ bom, onClose }: BomFormProps) => {
  const [formData, setFormData] = useState<Omit<BOM, "id">>(bom || defaultBom);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createBom, updateBom } = useBom();
  const { items } = useItems();

  // Filter items based on their type
  const sellItems = items.filter((item) => item.type === "sell");
  const purchaseItems = items.filter((item) => item.type === "purchase");
  const componentItems = items.filter((item) => item.type === "component");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.item_id) {
      newErrors.item_id = "Item is required";
    }
    if (!formData.component_id) {
      newErrors.component_id = "Component is required";
    }

    // Quantity validation
    if (formData.quantity < 1 || formData.quantity > 100) {
      newErrors.quantity = "Quantity must be between 1 and 100";
    }

    // Get the selected item and component
    const selectedItem = items.find((item) => item.id === formData.item_id);
    const selectedComponent = items.find(
      (item) => item.id === formData.component_id
    );

    if (selectedItem && selectedComponent) {
      // Purchase item cannot be item_id
      if (selectedItem.type === "purchase") {
        newErrors.item_id = "Purchase item cannot be an item in BOM";
      }

      // Sell item cannot be a component
      if (selectedComponent.type === "sell") {
        newErrors.component_id = "Sell item cannot be a component in BOM";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (bom?.id) {
        await updateBom({ ...formData, id: bom.id });
      } else {
        await createBom(formData);
      }
      onClose();
    } catch (error) {
      setErrors({ submit: "Failed to save BOM" });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bom ? "Edit BOM" : "Add New BOM"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Item</Label>
            <Select
              value={formData.item_id === 0 ? "" : formData.item_id.toString()}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  item_id: Number(value),
                });
                setErrors((prev) => ({ ...prev, item_id: "" }));
              }}
            >
              <SelectTrigger
                className={errors.item_id ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                {[...sellItems, ...componentItems].map((item) => (
                  <SelectItem key={item.id} value={item.id?.toString() || ""}>
                    {item.internal_item_name} ({item.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormError message={errors.item_id} />
          </div>

          <div>
            <Label>Component</Label>
            <Select
              value={
                formData.component_id === 0
                  ? ""
                  : formData.component_id.toString()
              }
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  component_id: Number(value),
                });
                setErrors((prev) => ({ ...prev, component_id: "" }));
              }}
            >
              <SelectTrigger
                className={errors.component_id ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select a component" />
              </SelectTrigger>
              <SelectContent>
                {[...purchaseItems, ...componentItems].map((item) => (
                  <SelectItem key={item.id} value={item.id?.toString() || ""}>
                    {item.internal_item_name} ({item.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormError message={errors.component_id} />
          </div>

          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={formData.quantity}
              onChange={(e) => {
                const value = Number(e.target.value);
                setFormData({
                  ...formData,
                  quantity: value,
                });
                if (value >= 1 && value <= 100) {
                  setErrors((prev) => ({ ...prev, quantity: "" }));
                }
              }}
              className={errors.quantity ? "border-destructive" : ""}
            />
            <FormError message={errors.quantity} />
          </div>

          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{bom ? "Update" : "Create"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
