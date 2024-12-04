import React from "react";
import { QueryProvider } from "./QueryProvider";

type AppProvidersProps = {
  children: React.ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return <QueryProvider>{children}</QueryProvider>;
};
