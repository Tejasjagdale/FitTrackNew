import React, { createContext, useContext, useState } from "react";
import { setAppUser } from "../data/githubService";

export type AppUser = "TJ" | "KU";

interface UserCtx {
  user: AppUser | null;
  chooseUser: (u: AppUser) => void;
}

const Context = createContext<UserCtx | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<AppUser | null>(null);

  const chooseUser = (u: AppUser) => {
    setAppUser(u);   // update github service
    setUser(u);      // update react tree
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