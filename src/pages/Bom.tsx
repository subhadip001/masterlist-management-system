import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBom } from "@/hooks/useBom";
import { BomList } from "@/components/bom/BomList";
import { BomForm } from "@/components/bom/BomForm";
import { BomUpload } from "@/components/bom/BomUpload";
import { Skeleton } from "@/components/ui/skeleton";
import { useItems } from "@/hooks/useItems";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBomStore } from "@/store/bomStore";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const Bom = () => {
  const { boms, isLoading: isLoadingBoms } = useBom();
  const { items, isLoading: isLoadingItems } = useItems();
  const { pendingBoms, csvErrors, setPendingSellItems } = useBomStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = window.location.hash;
    const [_, bomsTab] = hash.split("/");
    return bomsTab || "list";
  });

  useEffect(() => {
    const updateHash = () => {
      const [mainTab] = window.location.hash.split("/");
      window.location.hash = `${mainTab || "#boms"}/${activeTab}`;
    };

    const handleHashChange = () => {
      const [_, bomsTab] = window.location.hash.split("/");
      if (bomsTab) {
        setActiveTab(bomsTab);
      }
    };

    updateHash();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [activeTab]);

  // Update pending sell items whenever boms or items change
  useEffect(() => {
    if (!isLoadingBoms && !isLoadingItems) {
      // Find sell items without any BOM entries
      const sellItems = items.filter((item) => item.type === "sell");
      const sellItemsWithoutBom = sellItems.filter(
        (item) => !boms.some((bom) => bom.item_id === item.id)
      );
      setPendingSellItems(sellItemsWithoutBom);
    }
  }, [boms, items, isLoadingBoms, isLoadingItems, setPendingSellItems]);

  // Check if items exist before allowing BOM creation
  const sellOrComponentItems = items.filter(
    (item) => item.type === "sell" || item.type === "component"
  );
  const purchaseOrComponentItems = items.filter(
    (item) => item.type === "purchase" || item.type === "component"
  );
  const canCreateBom =
    sellOrComponentItems.length > 0 && purchaseOrComponentItems.length > 0;

  if (isLoadingBoms || isLoadingItems) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Bill of Materials Management</h2>
        <Button onClick={() => setShowAddModal(true)} disabled={!canCreateBom}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add BOM
        </Button>
      </div>

      {!canCreateBom && (
        <Alert className="m-4">
          <AlertDescription>
            You need at least one sell/component item and one purchase/component
            item to create a BOM.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList>
          <TabsTrigger value="list">BOM List</TabsTrigger>
          <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
          {(pendingBoms.length > 0 ||
            items
              .filter((item) => item.type === "sell")
              .filter((item) => !boms.some((bom) => bom.item_id === item.id))
              .length > 0) && (
            <TabsTrigger value="pending">
              Pending (
              {pendingBoms.length +
                items
                  .filter((item) => item.type === "sell")
                  .filter(
                    (item) => !boms.some((bom) => bom.item_id === item.id)
                  ).length}
              )
            </TabsTrigger>
          )}
          {csvErrors.length > 0 && (
            <TabsTrigger value="errors">
              Errors ({csvErrors.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list">
          {boms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No BOMs found. Create your first BOM by clicking the Add BOM
              button.
            </div>
          ) : (
            <BomList boms={boms} />
          )}
        </TabsContent>

        <TabsContent value="upload">
          <BomUpload />
        </TabsContent>

        {(pendingBoms.length > 0 ||
          items
            .filter((item) => item.type === "sell")
            .filter((item) => !boms.some((bom) => bom.item_id === item.id))
            .length > 0) && (
          <TabsContent value="pending">
            {items
              .filter((item) => item.type === "sell")
              .filter((item) => !boms.some((bom) => bom.item_id === item.id))
              .length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">
                  Sell Items Without BOM
                </h3>
                <Alert>
                  <AlertDescription>
                    The following sell items require at least one BOM entry:
                  </AlertDescription>
                </Alert>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items
                      .filter((item) => item.type === "sell")
                      .filter(
                        (item) => !boms.some((bom) => bom.item_id === item.id)
                      )
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.internal_item_name}</TableCell>
                          <TableCell>{item.item_description}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowAddModal(true);
                              }}
                            >
                              Create BOM
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {pendingBoms.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Pending BOMs</h3>
                <BomList boms={pendingBoms} isLoading={isLoadingBoms} />
              </div>
            )}
          </TabsContent>
        )}

        {csvErrors.length > 0 && (
          <TabsContent value="errors">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Upload Errors</h3>
                <Button variant="outline" onClick={() => {}}>
                  Download Errors
                </Button>
              </div>
              <div className="space-y-4">
                {csvErrors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertDescription>
                      Row {error.row}: {error.errors.join(", ")}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {showAddModal && <BomForm onClose={() => setShowAddModal(false)} />}
    </Card>
  );
};

export default Bom;
