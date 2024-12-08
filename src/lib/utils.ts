import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Item } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function checkItemNameExists(itemName: string, items: Item[]): boolean {
  if (!itemName) {
    return false;
  }

  if (!items || !Array.isArray(items)) {
    return false;
  }

  return items.some((item) => {
    if (!item) {
      console.log("Warning: Found null/undefined item in array");
      return false;
    }

    const internalNameMatch =
      item.internal_item_name?.toLowerCase() === itemName.toLowerCase();
    const customerNameMatch =
      item.customer_item_name?.toLowerCase() === itemName.toLowerCase();

    if (internalNameMatch || customerNameMatch) {
      console.log("Found matching item:", {
        itemName,
        internalName: item.internal_item_name,
        customerName: item.customer_item_name,
      });
    }

    return internalNameMatch || customerNameMatch;
  });
}

export const generateUniqueId = () => {
  return Math.floor(Math.random() * 1000000);
};
