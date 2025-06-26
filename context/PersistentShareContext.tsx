"use client";

import React, { createContext, useContext, ReactNode } from "react";
import usePersistentShare from "@/hooks/use-persistent-share";

type PersistentShareContextType = ReturnType<typeof usePersistentShare>;

// Create context with undefined default
const PersistentShareContext = createContext<PersistentShareContextType | undefined>(undefined);

export const PersistentShareProvider = ({ children }: { children: ReactNode }) => {
  const persistentShare = usePersistentShare();

  return (
    <PersistentShareContext.Provider value={persistentShare}>
      {children}
    </PersistentShareContext.Provider>
  );
};

// Custom hook for consuming the context
export const usePersistentShareContext = () => {
  const context = useContext(PersistentShareContext);
  if (!context) {
    throw new Error("usePersistentShareContext must be used within PersistentShareProvider");
  }
  return context;
};
