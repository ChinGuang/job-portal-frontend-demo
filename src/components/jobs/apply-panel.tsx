"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useJobSeekerProfile } from "@/hooks/use-profiles";
import { useApplyToJob } from "@/hooks/use-applications";
import { describeApplyError } from "@/lib/applications";
import { ApiError } from "@/lib/api-error";
import type { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-3 pt-6">{children}</CardContent>
    </Card>
  );
}

export function ApplyPanel({ job }: { job: Job }) {
  const { session, loading: authLoading } = useAuth();
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useJobSeekerProfile();
  const apply = useApplyToJob(job.id);
  const [coverLetter, setCoverLetter] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  // Only published jobs accept applications.
  if (job.status !== "PUBLISHED") {
    return (
      <Panel>
        <Button className="w-full" disabled>
          Applications closed
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          This role is no longer accepting applications.
        </p>
      </Panel>
    );
  }

  if (authLoading) {
    return (
      <Panel>
        <Button className="w-full" disabled>
          Loading…
        </Button>
      </Panel>
    );
  }

  if (!session) {
    return (
      <Panel>
        <Button
          className="w-full"
          render={<Link href={`/login?redirect=/jobs/${job.id}`} />}
        >
          Sign in to apply
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          You&apos;ll need a job-seeker profile with a résumé to apply.
        </p>
      </Panel>
    );
  }

  if (profileLoading) {
    return (
      <Panel>
        <Button className="w-full" disabled>
          Checking eligibility…
        </Button>
      </Panel>
    );
  }

  // A failed profile fetch is not the same as "no profile" — don't mislead an
  // existing seeker into creating another profile.
  if (profileError) {
    return (
      <Panel>
        <Button className="w-full" disabled>
          Couldn&apos;t check eligibility
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Something went wrong loading your profile. Please refresh.
        </p>
      </Panel>
    );
  }

  if (!profile) {
    return (
      <Panel>
        <Button
          className="w-full"
          render={<Link href="/profile/job-seeker" />}
        >
          Create a seeker profile
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Create a job-seeker profile before applying.
        </p>
      </Panel>
    );
  }

  if (!profile.resumeUrl) {
    return (
      <Panel>
        <Button
          className="w-full"
          variant="outline"
          render={<Link href="/profile/job-seeker" />}
        >
          Add a résumé to apply
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Applications need a résumé. Upload one on your profile, then come back.
        </p>
      </Panel>
    );
  }

  if (apply.isSuccess) {
    return (
      <Panel>
        <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4" aria-hidden />
          Application submitted
        </p>
        <Button
          className="w-full"
          variant="outline"
          render={<Link href="/seeker/applications" />}
        >
          Track your applications
        </Button>
      </Panel>
    );
  }

  // A 409 means the seeker already applied — a terminal state, not retryable.
  if (apply.error instanceof ApiError && apply.error.status === 409) {
    return (
      <Panel>
        <Button className="w-full" variant="outline" disabled>
          Already applied
        </Button>
        <Button
          className="w-full"
          variant="ghost"
          render={<Link href="/seeker/applications" />}
        >
          Track your applications
        </Button>
      </Panel>
    );
  }

  return (
    <Panel>
      {formOpen ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            apply.mutate({ coverLetter: coverLetter.trim() || undefined });
          }}
        >
          <div className="space-y-1.5">
            <label htmlFor="coverLetter" className="text-sm font-medium">
              Cover letter <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the employer why you're a great fit…"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Your profile résumé will be attached.
          </p>
          {apply.isError ? (
            <p className="text-sm text-destructive">
              {describeApplyError(apply.error)}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={apply.isPending}>
              {apply.isPending ? "Submitting…" : "Submit application"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={apply.isPending}
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <Button className="w-full" onClick={() => setFormOpen(true)}>
            Apply now
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Applying attaches your profile résumé.
          </p>
        </>
      )}
    </Panel>
  );
}
