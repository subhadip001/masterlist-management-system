import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBom } from "@/hooks/useBom";
import { useItems } from "@/hooks/useItems";
import { BOM } from "@/types";
import { FileDown } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import { useBomStore } from "@/store/bomStore";

type ValidationError = {
  row: number;
  errors: string[];
  data: BOM;
};

export const BomUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const { setPendingBoms } = useBomStore();
  const { items } = useItems();
  const { createBom } = useBom();

  const validateRow = (
    row: BOM,
    rowIndex: number
  ): { errors: string[]; isPending: boolean } => {
    const errors: string[] = [];
    let isPending = false;

    if (!row.item_id) errors.push("Item ID is required");
    if (!row.component_id) errors.push("Component ID is required");
    if (!row.quantity?.toString().trim()) errors.push("Quantity is required");

    const quantity = Number(row.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push("Quantity must be a positive number");
    }

    if (errors.length === 0) {
      const itemExists = items.some((item) => item.id === row.item_id);
      const componentExists = items.some(
        (item) => item.id === row.component_id
      );

      if (!itemExists || !componentExists) {
        isPending = true;
      }
    }

    return { errors, isPending };
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    setErrors([]);
    setSuccessCount(0);
    setPendingCount(0);

    try {
      let data: BOM[];

      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        console.log("Parsed XLSX data:", jsonData);

        data = jsonData.map((row: any) => ({
          id: row.id,
          item_id: Number(row.item_id),
          component_id: Number(row.component_id),
          quantity: Number(row.quantity),
          created_by: row.created_by || "system_user",
          last_updated_by: row.last_updated_by || "system_user",
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }));
      } else {
        throw new Error("Unsupported file format. Please upload an XLSX file.");
      }

      const validationErrors: ValidationError[] = [];
      const validBoms: BOM[] = [];
      const pendingBoms: BOM[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const { errors, isPending } = validateRow(row, i);

        if (errors.length > 0) {
          validationErrors.push({
            row: i + 2,
            errors,
            data: row,
          });
        } else if (isPending) {
          pendingBoms.push(row);
        } else {
          validBoms.push(row);
        }

        setProgress(((i + 1) / data.length) * 100);
      }

      // Handle valid BOMs
      for (const bom of validBoms) {
        try {
          await createBom(bom);
        } catch (error) {
          validationErrors.push({
            row: 0,
            errors: [(error as Error).message],
            data: bom,
          });
        }
      }

      setErrors(validationErrors);
      setPendingBoms(pendingBoms);
      setSuccessCount(validBoms.length);
      setPendingCount(pendingBoms.length);
    } catch (error) {
      setErrors([
        {
          row: 0,
          errors: [(error as Error).message],
          data: {} as BOM,
        },
      ]);
    } finally {
      setIsUploading(false);
      setProgress(100);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "id",
        "item_id",
        "component_id",
        "quantity",
        "created_by",
        "last_updated_by",
        "createdAt",
        "updatedAt",
      ],
      [
        1,
        1,
        2,
        10,
        "system_user",
        "system_user",
        "2024-02-01T12:00:00Z",
        "2024-02-01T12:00:00Z",
      ],
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BOM Template");
    XLSX.writeFile(wb, "bom_upload_template.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Button
          variant="outline"
          onClick={downloadTemplate}
          disabled={isUploading}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Template
        </Button>
      </div>

      {isUploading && (
        <Progress value={progress} className="w-full transition-all" />
      )}

      {successCount > 0 && (
        <Alert>
          <AlertDescription>
            Successfully added {successCount} BOM entries
            {pendingCount > 0 &&
              ` and ${pendingCount} entries are pending (waiting for items to be created)`}
          </AlertDescription>
        </Alert>
      )}

      {errors.length > 0 && (
        <div className="space-y-2">
          <Alert variant="destructive">
            <AlertDescription>
              Found {errors.length} errors in the upload
            </AlertDescription>
          </Alert>

          <ScrollArea className="h-[300px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Errors</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((error, index) => (
                  <TableRow key={index}>
                    <TableCell>{error.row}</TableCell>
                    <TableCell>
                      <ul className="list-disc pl-4">
                        {error.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>
                      <pre className="text-xs">
                        {JSON.stringify(error.data, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
