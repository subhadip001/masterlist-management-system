import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemList } from "@/components/items/ItemList";
import { ItemUpload } from "@/components/items/ItemUpload";
import { useItems } from "@/hooks/useItems";
import { useItemStore } from "@/store/itemStore";
import { Button } from "@/components/ui/button";
import { ItemForm } from "@/components/items/ItemForm";
import { ItemTypes, UOM } from "@/types";

export default function Items() {
  const { items, isLoading } = useItems();
  const { pendingItems, csvErrors } = useItemStore();
  const [isAddingItem, setIsAddingItem] = useState(false);

  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = window.location.hash;
    const [_, itemsTab] = hash.split("/");
    return itemsTab || "list";
  });

  useEffect(() => {
    const updateHash = () => {
      const [mainTab] = window.location.hash.split("/");
      window.location.hash = `${mainTab || "#items"}/${activeTab}`;
    };

    const handleHashChange = () => {
      const [_, itemsTab] = window.location.hash.split("/");
      if (itemsTab) {
        setActiveTab(itemsTab);
      }
    };

    updateHash();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [activeTab]);

  return (
    <Card>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Items Management</h2>
        <Button onClick={() => setIsAddingItem(true)}>Add Item</Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList>
          <TabsTrigger value="list">Items List</TabsTrigger>
          <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
          {pendingItems.length > 0 && (
            <TabsTrigger value="pending">
              Pending ({pendingItems.length})
            </TabsTrigger>
          )}
          {csvErrors.length > 0 && (
            <TabsTrigger value="errors">
              Errors ({csvErrors.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list">
          <ItemList items={items} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="upload">
          <ItemUpload />
        </TabsContent>

        {pendingItems.length > 0 && (
          <TabsContent value="pending">
            <ItemList items={pendingItems} isPending />
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
              {/* Error list */}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {isAddingItem && <ItemForm onClose={() => setIsAddingItem(false)} />}
    </Card>
  );
}
