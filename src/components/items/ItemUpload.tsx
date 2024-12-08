import { useState, useEffect } from "react";
import { useItemStore } from "@/store/itemStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useItems } from "@/hooks/useItems";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Item, ItemTypes, UOM } from "@/types";
import { Download, Upload, FileDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { checkItemNameExists, generateUniqueId } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

type CSVRow = Item;

type ValidationError = {
  row: number;
  errors: string[];
  data: CSVRow;
};

export const ItemUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { setPendingItems } = useItemStore();
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const { createItem, items, isLoading } = useItems();

  useEffect(() => {
    console.log("ItemUpload mounted");
    console.log("Items loading status:", isLoading);
    console.log("Current items:", items);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      console.log("Items loading completed");
      console.log("Items count:", items.length);
      console.log("Items:", items);
    }
  }, [isLoading, items]);

  const validateRow = (row: CSVRow, rowIndex: number): string[] => {
    const errors: string[] = [];

    // Check required fields
    if (!row.id) errors.push("ID is required");
    if (!row.internal_item_name?.trim()) errors.push("Item name is required");
    if (!row.type?.trim()) errors.push("Type is required");
    if (!row.uom?.trim()) errors.push("UOM is required");
    if (!row.min_buffer?.toString().trim())
      errors.push("Min buffer is required");
    if (!row.max_buffer?.toString().trim())
      errors.push("Max buffer is required");

    // Type validation
    if (
      row.type &&
      !["sell", "purchase", "component"].includes(row.type.toLowerCase().trim())
    ) {
      errors.push("Type must be sell, purchase, or component");
    }

    // UOM validation
    if (row.uom && !["kgs", "nos"].includes(row.uom.toLowerCase().trim())) {
      errors.push("UOM must be Kgs or Nos");
    }

    // Buffer validation
    const minBuffer = Number(row.min_buffer);
    const maxBuffer = Number(row.max_buffer);
    if (isNaN(minBuffer)) errors.push("Min buffer must be a number");
    if (isNaN(maxBuffer)) errors.push("Max buffer must be a number");
    if (!isNaN(minBuffer) && !isNaN(maxBuffer) && maxBuffer < minBuffer) {
      errors.push("Max buffer must be greater than or equal to min buffer");
    }

    // Scrap type validation for sell items
    if (
      row.type?.toLowerCase().trim() === "sell" &&
      !row.additional_attributes.scrap_type?.trim()
    ) {
      errors.push("Scrap type is required for sell items");
    }

    return errors;
  };

  const processFile = async (file: File) => {
    if (isLoading) {
      console.log("Items are still loading, please wait...");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setErrors([]);
    setSuccessCount(0);

    try {
      let data: CSVRow[];

      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // Transform the data to ensure consistent field names
        data = jsonData.map((row: any) => ({
          id: row.id,
          internal_item_name: row.internal_item_name,
          tenant_id: Number(row.tenant_id),
          type: row.type,
          uom: row.uom,
          min_buffer: row.min_buffer?.toString(),
          max_buffer: row.max_buffer?.toString(),
          scrap_type: row.scrap_type,
          item_description: row.item_description,
          created_by: row.created_by,
          last_updated_by: row.last_updated_by,
          is_deleted: row.is_deleted,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          additional_attributes: {
            avg_weight_needed: row.additional_attributes__avg_weight_needed,
            scrap_type:
              row.type?.toLowerCase().trim() === ItemTypes.sell
                ? row.additional_attributes__scrap_type?.trim()
                : undefined,
          },
        }));
      } else {
        // Handle CSV files
        const result = await new Promise<Papa.ParseResult<CSVRow>>(
          (resolve) => {
            Papa.parse(file, {
              header: true,
              skipEmptyLines: "greedy",
              transformHeader: (header) => header.trim().toLowerCase(),
              complete: resolve,
            });
          }
        );
        data = result.data;
      }

      const validationErrors: ValidationError[] = [];
      const validItems: Omit<Item, "id">[] = [];
      const existingItems: Omit<Item, "id">[] = [];

      console.log("Processing with items:", items.length);

      const totalRows = data.length;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowErrors = validateRow(row, i + 1);

        if (rowErrors.length > 0) {
          validationErrors.push({
            row: i + 1,
            errors: rowErrors,
            data: row,
          });
        } else {
          const transformedItem = {
            internal_item_name: row.internal_item_name.trim(),
            tenant_id: generateUniqueId(),
            type: row.type.toLowerCase().trim() as ItemTypes,
            uom: row.uom.toUpperCase().trim() as UOM,
            min_buffer: Number(row.min_buffer),
            max_buffer: Number(row.max_buffer),
            created_by: "system_user",
            last_updated_by: "system_user",
            is_deleted: false,
            additional_attributes: {
              avg_weight_needed: row.additional_attributes?.avg_weight_needed,
              scrap_type:
                row.type?.toLowerCase().trim() === ItemTypes.sell
                  ? row.additional_attributes?.scrap_type?.trim()
                  : undefined,
            },
            item_description: row.item_description?.trim() || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const isItemExists = checkItemNameExists(
            transformedItem.internal_item_name,
            items
          );

          if (isItemExists) {
            console.log("Item exists:", transformedItem.internal_item_name);
            existingItems.push(transformedItem);
          } else {
            console.log("New item:", transformedItem.internal_item_name);
            validItems.push(transformedItem);
          }
        }

        setProgress(((i + 1) / totalRows) * 100);
      }

      setErrors(validationErrors);

      if (validItems.length > 0) {
        await Promise.all(validItems.map((item) => createItem(item)));
        setSuccessCount(validItems.length);
      }

      if (existingItems.length > 0) {
        setPendingItems(existingItems as Item[]);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setErrors([
        {
          row: 0,
          errors: [
            "Failed to process file. Please ensure the file format is correct.",
          ],
          data: {} as CSVRow,
        },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const downloadErrorsCSV = () => {
    if (errors.length === 0) return;

    const csvContent = Papa.unparse({
      fields: ["Row", "Error", ...Object.keys(errors[0].data)],
      data: errors.flatMap((error) =>
        error.errors.map((err) => ({
          Row: error.row,
          Error: err,
          ...error.data,
        }))
      ),
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "item-upload-errors.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const template = [
      {
        id: "1",
        internal_item_name: "SELL_ITEM_001",
        tenant_id: "123",
        type: "sell",
        uom: "kgs",
        min_buffer: "10",
        max_buffer: "20",
        created_by: "system_user",
        last_updated_by: "system_user",
        is_deleted: false,
        item_description: "Sample sell item",
        additional_attributes__avg_weight_needed: true,
        additional_attributes__scrap_type: "scrap_a",
      },
      {
        id: "2",
        internal_item_name: "PURCHASE_ITEM_001",
        tenant_id: "123",
        type: "purchase",
        uom: "kgs",
        min_buffer: "50",
        max_buffer: "100",
        created_by: "system_user",
        last_updated_by: "system_user",
        is_deleted: false,
        item_description: "Sample purchase item",
        additional_attributes__avg_weight_needed: false,
        additional_attributes__scrap_type: undefined,
      },
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(template);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "item-upload-template.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="whitespace-nowrap"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {errors.length > 0 && (
          <Button
            variant="outline"
            onClick={downloadErrorsCSV}
            className="whitespace-nowrap"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Errors
          </Button>
        )}
      </div>

      {isUploading && <Progress value={progress} className="w-full" />}

      {(errors.length > 0 || successCount > 0) && (
        <Alert>
          <AlertDescription className="space-y-2">
            <div>
              Processed items: {successCount} successful
              {errors.length > 0 && `, ${errors.length} with errors`}
            </div>
            {errors.length > 0 && (
              <>
                <div className="text-destructive mb-2">
                  Please review the errors below or download the errors file for
                  details of the failed entries. Fix the issues and upload only
                  the corrected entries.
                </div>
                <ScrollArea className="h-[300px] rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errors.flatMap((error) =>
                        error.errors.map((err, index) => (
                          <TableRow key={`${error.row}-${index}`}>
                            <TableCell>{error.row}</TableCell>
                            <TableCell>
                              {err.toLowerCase().includes("required")
                                ? err.split(" is ")[0]
                                : err.includes("must be")
                                ? err.split(" must ")[0]
                                : "Multiple"}
                            </TableCell>
                            <TableCell className="text-destructive">
                              {err}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
