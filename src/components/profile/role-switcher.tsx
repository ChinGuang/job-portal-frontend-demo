"use client";

import { useActiveRole } from "./active-role-provider";
import { ROLE_LABELS, ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";

/**
 * Segmented toggle for the active role. Renders nothing unless the account holds
 * both profiles (there is nothing to switch between otherwise).
 */
export function RoleSwitcher() {
  const { activeRole, setActiveRole, canSwitch } = useActiveRole();

  if (!canSwitch) return null;

  return (
    <div
      role="group"
      aria-label="Active role"
      className="inline-flex items-center rounded-lg border p-0.5"
    >
      {ROLES.map((role) => {
        const active = activeRole === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => setActiveRole(role)}
            aria-pressed={active}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {ROLE_LABELS[role]}
          </button>
        );
      })}
    </div>
  );
}
