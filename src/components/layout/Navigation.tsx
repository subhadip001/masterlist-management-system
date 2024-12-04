import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Bom from "@/pages/Bom";
import Items from "@/pages/Items";
import { useEffect, useState } from "react";

export const Navigation = () => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = window.location.hash.replace("#", "");
    return hash.split("/")[0] || "items";
  });

  useEffect(() => {
    const updateHash = () => {
      const currentHash = window.location.hash.replace("#", "");
      const [_, subTab] = currentHash.split("/");
      window.location.hash = subTab
        ? `${activeTab}/${subTab}`
        : `${activeTab}/list`;
    };

    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      const [mainTab] = hash.split("/");
      if (mainTab && (mainTab === "items" || mainTab === "bom")) {
        setActiveTab(mainTab);
      }
    };

    updateHash();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [activeTab]);

  return (
    <div className="flex-1 p-2">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="bom">Bill of Materials</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="items" className="space-y-4">
          <Items />
        </TabsContent>
        <TabsContent value="bom" className="space-y-4">
          <Bom />
        </TabsContent>
      </Tabs>
    </div>
  );
};
