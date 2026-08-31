"use client";

import Link from "next/link";
import { useCapabilities } from "@/hooks/use-profiles";
import { CenteredSpinner } from "@/components/common/states";
import { Button } from "@/components/ui/button";

/**
 * Gate for employer-only pages. Assumes it is rendered inside `RequireAuth`
 * (a session exists); it additionally requires an employer profile.
 */
export function RequireEmployer({ children }: { children: React.ReactNode }) {
  const { hasEmployer, isLoading } = useCapabilities();

  if (isLoading) return <CenteredSpinner />;

  if (!hasEmployer) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Employer profile required</h1>
        <p className="mt-2 text-muted-foreground">
          Create an employer profile to post and manage job listings.
        </p>
        <Button className="mt-6" render={<Link href="/profile/employer" />}>
          Create employer profile
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
