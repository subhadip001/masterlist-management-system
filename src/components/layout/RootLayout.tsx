import React from "react";
import { Navigation } from "./Navigation";

type RootLayoutProps = {
  children?: React.ReactNode;
};

export const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <div className="h-screen bg-background">
      <div className="flex h-screen">
        <div className="flex-1">
          <Navigation />
          {children}
        </div>
      </div>
    </div>
  );
};
