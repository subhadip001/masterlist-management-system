import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Item } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function checkItemNameExists(itemName: string, items: Item[]): boolean {
  return items.some(
    (item) =>
      item.internal_item_name.toLowerCase() === itemName.toLowerCase() ||
      (item.customer_item_name &&
        item.customer_item_name.toLowerCase() === itemName.toLowerCase())
  );
}

export const generateUniqueId = () => {
  return Math.floor(Math.random() * 1000000);
};
