"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { RequireEmployer } from "@/components/employer/require-employer";
import { JobForm } from "@/components/employer/job-form";
import { JobStatusControls } from "@/components/employer/job-status-controls";
import { useMyJobs } from "@/hooks/use-employer-jobs";
import { STATUS_LABELS } from "@/lib/job-status";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function EditJobContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isLoading, isError } = useMyJobs();
  const job = data?.items.find((item) => item.id === id) ?? null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        href="/employer/jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to listings
      </Link>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <p className="text-sm text-destructive">Couldn&apos;t load this listing.</p>
      ) : !job ? (
        <p className="text-sm text-muted-foreground">Listing not found.</p>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit listing</CardTitle>
              <CardDescription>
                Status: {STATUS_LABELS[job.status]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobForm
                job={job}
                onSaved={() => router.push("/employer/jobs")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status &amp; visibility</CardTitle>
              <CardDescription>
                Publish, close, reopen, or archive this listing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobStatusControls job={job} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function EditJobPage() {
  return (
    <RequireAuth>
      <RequireEmployer>
        <EditJobContent />
      </RequireEmployer>
    </RequireAuth>
  );
}
