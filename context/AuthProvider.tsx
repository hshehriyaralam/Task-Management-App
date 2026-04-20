"use client";

import { useState } from "react";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }: any) {
  const [postLoginRedirect, setPostLoginRedirect] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ postLoginRedirect, setPostLoginRedirect }}>
      {children}
    </AuthContext.Provider>
  );
}