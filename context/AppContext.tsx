"use client";

import { createContext, useContext } from "react";

const AppContext = createContext<any>(null);

export const AppProvider = ({ children, value }: any) => {
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};