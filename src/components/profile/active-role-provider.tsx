"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useCapabilities } from "@/hooks/use-profiles";
import {
  resolveActiveRole,
  type ProfileCapabilities,
  type Role,
} from "@/lib/roles";

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
  const { hasJobSeeker, hasEmployer } = useCapabilities();
  const [stored, setStored] = useState<string | null>(readStoredRole);

  const setActiveRole = useCallback((role: Role) => {
    setStored(role);
    try {
      window.localStorage.setItem(STORAGE_KEY, role);
    } catch {
      // Ignore write failures (private mode / disabled storage).
    }
  }, []);

  const activeRole = resolveActiveRole({ hasJobSeeker, hasEmployer }, stored);

  // Stamp the active role on <html> so the accent tokens in globals.css apply
  // (teal for job-seeker, indigo for employer). Cleared when there is no role,
  // so public/logged-out pages keep the neutral base.
  useEffect(() => {
    const root = document.documentElement;
    if (activeRole) root.dataset.role = activeRole;
    else delete root.dataset.role;
    return () => {
      delete root.dataset.role;
    };
  }, [activeRole]);

  const value = useMemo<ActiveRoleContextValue>(() => {
    const capabilities: ProfileCapabilities = { hasJobSeeker, hasEmployer };
    return {
      activeRole,
      setActiveRole,
      canSwitch: hasJobSeeker && hasEmployer,
      capabilities,
    };
  }, [activeRole, hasJobSeeker, hasEmployer, setActiveRole]);

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
