export type Item = {
  id?: number;
  internal_item_name: string;
  tenant_id: number;
  item_description: string;
  uom: UOM;
  created_by: string;
  last_updated_by: string;
  type: ItemTypes;
  max_buffer: number | null;
  min_buffer: number | null;
  customer_item_name?: string;
  is_deleted: boolean;
  createdAt?: string;
  updatedAt?: string;
  additional_attributes: {
    drawing_revision_number?: number;
    drawing_revision_date?: string;
    avg_weight_needed: boolean;
    scrap_type?: string;
    shelf_floor_alternate_name?: string;
  };
};

export type BOM = {
  id?: number;
  item_id: number;
  component_id: number;
  quantity: number;
  created_by: string;
  last_updated_by: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CsvError = {
  row: number;
  errors: string[];
  data: Record<string, any>;
};

export enum ItemTypes {
  sell = "sell",
  purchase = "purchase",
  component = "component",
}

export enum UOM {
  kgs = "Kgs",
  nos = "Nos",
}
