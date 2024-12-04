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
import { Checkbox } from "@/components/ui/checkbox";
import { Item, ItemTypes, UOM } from "@/types";
import { useItems } from "@/hooks/useItems";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormError } from "../form-error";
import { generateUniqueId } from "@/lib/utils";

type ItemFormProps = {
  item?: Item;
  onClose: () => void;
};

const defaultItem: Omit<Item, "id"> = {
  internal_item_name: "",
  tenant_id: generateUniqueId(),
  item_description: "",
  uom: UOM.nos,
  created_by: "system_user",
  last_updated_by: "system_user",
  type: ItemTypes.sell,
  max_buffer: 0,
  min_buffer: 0,
  is_deleted: false,
  customer_item_name: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  additional_attributes: {
    avg_weight_needed: false,
  },
};

export const ItemForm = ({ item, onClose }: ItemFormProps) => {
  const [formData, setFormData] = useState<Omit<Item, "id">>(
    item || defaultItem
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createItem, updateItem } = useItems();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.internal_item_name) {
      newErrors.internal_item_name = "Item name is required";
    }

    if (!formData.type) {
      newErrors.type = "Item type is required";
    }

    // Type-specific validations
    if (
      formData.type === "sell" &&
      !formData.additional_attributes?.scrap_type
    ) {
      newErrors.scrap_type = "Scrap type is required for sell items";
    }

    // Buffer validations
    if (formData.min_buffer === null || formData.max_buffer === null) {
      newErrors.min_buffer = "Min buffer is required";
      newErrors.max_buffer = "Max buffer is required";
    }

    if (formData.min_buffer !== null && formData.min_buffer < 0) {
      newErrors.min_buffer = "Min buffer cannot be negative";
    }

    if (formData.max_buffer !== null && formData.max_buffer < 0) {
      newErrors.max_buffer = "Max buffer cannot be negative";
    }

    if (
      formData.max_buffer !== null &&
      formData.min_buffer !== null &&
      formData.max_buffer < formData.min_buffer
    ) {
      newErrors.max_buffer =
        "Max buffer must be greater than or equal to min buffer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (item?.id) {
        await updateItem({ ...formData, id: item.id });
      } else {
        await createItem(formData);
      }
      onClose();
    } catch (error) {
      setErrors({ submit: "Failed to save item" });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add New Item"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Internal Item Name</Label>
            <Input
              value={formData.internal_item_name}
              className={
                errors.internal_item_name
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }
              placeholder="Enter internal item name"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  internal_item_name: e.target.value,
                });
                if (e.target.value) {
                  setErrors((prev) => {
                    const { internal_item_name, ...rest } = prev;
                    return rest;
                  });
                }
              }}
            />
            <FormError message={errors.internal_item_name} />
          </div>
          <div>
            <Label>Item Description</Label>
            <Input
              value={formData.item_description}
              placeholder="Enter item description"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  item_description: e.target.value,
                })
              }
            />
            <FormError message={errors.item_description} />
          </div>

          <div>
            <Label>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: ItemTypes) => {
                setFormData({
                  ...formData,
                  type: value,
                  additional_attributes: {
                    ...formData.additional_attributes,
                    scrap_type:
                      value === ItemTypes.sell
                        ? formData.additional_attributes.scrap_type
                        : undefined,
                  },
                });
                setErrors((prev) => {
                  const { type, scrap_type, ...rest } = prev;
                  return rest;
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sell">Sell</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="component">Component</SelectItem>
              </SelectContent>
            </Select>
            <FormError message={errors.type} />
          </div>

          <div>
            <Label>UOM</Label>
            <Select
              value={formData.uom}
              onValueChange={(value: UOM) =>
                setFormData({
                  ...formData,
                  uom: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kgs">Kgs</SelectItem>
                <SelectItem value="Nos">Nos</SelectItem>
              </SelectContent>
            </Select>
            <FormError message={errors.uom} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="avg_weight_needed"
                checked={formData.additional_attributes.avg_weight_needed}
                onCheckedChange={(checked: boolean) =>
                  setFormData({
                    ...formData,
                    additional_attributes: {
                      ...formData.additional_attributes,
                      avg_weight_needed: checked as boolean,
                    },
                  })
                }
              />
              <Label htmlFor="avg_weight_needed">Average Weight Needed</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Buffer</Label>
              <Input
                type="number"
                placeholder="Enter min buffer"
                value={formData.min_buffer ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_buffer:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
              <FormError message={errors.min_buffer} />
            </div>
            <div>
              <Label>Max Buffer</Label>
              <Input
                type="number"
                value={formData.max_buffer ?? ""}
                placeholder="Enter max buffer"
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? null : Number(e.target.value);
                  setFormData({
                    ...formData,
                    max_buffer: value,
                  });
                  if (value === null || value >= (formData.min_buffer ?? 0)) {
                    setErrors((prev) => {
                      const { max_buffer, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
              />
              <FormError message={errors.max_buffer} />
            </div>
          </div>

          {formData.type === "sell" && (
            <div>
              <Label>Scrap Type</Label>
              <Select
                value={formData.additional_attributes.scrap_type}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    additional_attributes: {
                      ...formData.additional_attributes,
                      scrap_type: value,
                    },
                  });
                  if (value) {
                    setErrors((prev) => {
                      const { scrap_type, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a scrap type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scrap_a">Scrap A</SelectItem>
                  <SelectItem value="scrap_b">Scrap B</SelectItem>
                </SelectContent>
              </Select>
              <FormError message={errors.scrap_type} />
            </div>
          )}

          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{item ? "Update" : "Create"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
