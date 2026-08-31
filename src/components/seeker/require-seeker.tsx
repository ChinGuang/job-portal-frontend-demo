"use client";

import Link from "next/link";
import { useCapabilities } from "@/hooks/use-profiles";
import { CenteredSpinner } from "@/components/common/states";
import { Button } from "@/components/ui/button";

/**
 * Gate for seeker-only pages. Assumes it is rendered inside `RequireAuth`
 * (a session exists); it additionally requires a job-seeker profile.
 */
export function RequireSeeker({ children }: { children: React.ReactNode }) {
  const { hasJobSeeker, isLoading } = useCapabilities();

  if (isLoading) return <CenteredSpinner />;

  if (!hasJobSeeker) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Job-seeker profile required</h1>
        <p className="mt-2 text-muted-foreground">
          Create a job-seeker profile to apply for jobs and track applications.
        </p>
        <Button className="mt-6" render={<Link href="/profile/job-seeker" />}>
          Create job-seeker profile
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
