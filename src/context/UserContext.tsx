import React, { createContext, useContext, useState } from "react";
import { setAppUser } from "../data/githubService";

export type AppUser = "TJ" | "KU";

interface UserCtx {
  user: AppUser | null;
  chooseUser: (u: AppUser) => void;
}

const Context = createContext<UserCtx | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {

  const DEFAULT_USER: AppUser = "KU"; // your default

  const [user, setUser] = useState<AppUser | null>(DEFAULT_USER);

  /* 🔥 CRITICAL: sync github service on mount */
  React.useEffect(() => {
    if (DEFAULT_USER) {
      setAppUser(DEFAULT_USER);
    }
  }, []);

  const chooseUser = (u: AppUser) => {
    setAppUser(u);
    setUser(u);
  };

  return (
    <Context.Provider value={{ user, chooseUser }}>
      {children}
    </Context.Provider>
  );
}
export function useUser() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
}