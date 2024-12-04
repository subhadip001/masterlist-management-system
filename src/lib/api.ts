import axios from "axios";

export const API_BASE_URL = "https://api-assignment.inveesync.in";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const endpoints = {
  items: {
    list: "/items",
    create: "/items",
    update: (id: number) => `/items/${id}`,
    delete: (id: number) => `/items/${id}`,
  },
  bom: {
    list: "/bom",
    create: "/bom",
    update: (id: number) => `/bom/${id}`,
    delete: (id: number) => `/bom/${id}`,
  },
} as const;
