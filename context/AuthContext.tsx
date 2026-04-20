"use client"
import { createContext, useContext } from "react";

type AuthContextType = {
  postLoginRedirect: string | null;
  setPostLoginRedirect: React.Dispatch<React.SetStateAction<string | null>>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}