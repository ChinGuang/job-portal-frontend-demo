"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useMe } from "@/hooks/use-me";
import { deriveCapabilities, type ProfileCapabilities } from "@/lib/me";
import { resolveActiveRole, type Role } from "@/lib/roles";

const STORAGE_KEY = "job-portal.active-role";

interface ActiveRoleContextValue {
  /** The role the user is currently acting as, or null when they hold no profile. */
  activeRole: Role | null;
  /** Persist a new active role (only meaningful when both profiles exist). */
  setActiveRole(role: Role): void;
  /** True when the account holds both profiles and can toggle between them. */
  canSwitch: boolean;
  capabilities: ProfileCapabilities;
}

const ActiveRoleContext = createContext<ActiveRoleContextValue | null>(null);

function readStoredRole(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function ActiveRoleProvider({ children }: { children: React.ReactNode }) {
  const { data: me } = useMe();
  const capabilities = deriveCapabilities(me);
  const [stored, setStored] = useState<string | null>(readStoredRole);

  const setActiveRole = useCallback((role: Role) => {
    setStored(role);
    try {
      window.localStorage.setItem(STORAGE_KEY, role);
    } catch {
      // Ignore write failures (private mode / disabled storage).
    }
  }, []);

  const value = useMemo<ActiveRoleContextValue>(() => {
    return {
      activeRole: resolveActiveRole(capabilities, stored),
      setActiveRole,
      canSwitch: capabilities.hasJobSeeker && capabilities.hasEmployer,
      capabilities,
    };
  }, [capabilities, stored, setActiveRole]);

  return (
    <ActiveRoleContext.Provider value={value}>
      {children}
    </ActiveRoleContext.Provider>
  );
}

export function useActiveRole(): ActiveRoleContextValue {
  const context = useContext(ActiveRoleContext);
  if (!context) {
    throw new Error("useActiveRole must be used within an ActiveRoleProvider");
  }
  return context;
}
