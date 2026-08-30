"use client";

import { useState } from "react";
import { useArchiveJob, useUpdateJobStatus } from "@/hooks/use-employer-jobs";
import { statusActions } from "@/lib/job-status";
import { ApiError } from "@/lib/api-error";
import type { Job } from "@/types/job";
import { Button } from "@/components/ui/button";

function errorText(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    return "That status change isn't allowed.";
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}

/** Status-transition buttons + archive action for one job. */
export function JobStatusControls({ job }: { job: Job }) {
  const changeStatus = useUpdateJobStatus(job.id);
  const archive = useArchiveJob(job.id);
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  const actions = statusActions(job.status);
  const busy = changeStatus.isPending || archive.isPending;
  const archived = job.status === "ARCHIVED";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.to}
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => changeStatus.mutate(action.to)}
          >
            {action.label}
          </Button>
        ))}

        {archived ? null : confirmingArchive ? (
          <>
            <Button
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() =>
                archive.mutate(undefined, {
                  onSuccess: () => setConfirmingArchive(false),
                })
              }
            >
              Confirm archive
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => setConfirmingArchive(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => setConfirmingArchive(true)}
          >
            Archive
          </Button>
        )}
      </div>

      {changeStatus.isError ? (
        <p className="text-sm text-destructive">
          {errorText(changeStatus.error)}
        </p>
      ) : null}
      {archive.isError ? (
        <p className="text-sm text-destructive">{errorText(archive.error)}</p>
      ) : null}
    </div>
  );
}
