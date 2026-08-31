"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { RequireSeeker } from "./require-seeker";

/**
 * Shared chrome for seeker pages: the auth + seeker-profile guards, the centered
 * container, and an optional "back" link.
 */
export function SeekerPageShell({
  maxWidth = "max-w-4xl",
  backHref,
  backLabel,
  children,
}: {
  maxWidth?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <RequireSeeker>
        <div className={`mx-auto w-full ${maxWidth} px-4 py-10`}>
          {backHref ? (
            <Link
              href={backHref}
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden />
              {backLabel ?? "Back"}
            </Link>
          ) : null}
          {children}
        </div>
      </RequireSeeker>
    </RequireAuth>
  );
}
