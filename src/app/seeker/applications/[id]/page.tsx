"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, MapPin } from "lucide-react";
import { SeekerPageShell } from "@/components/seeker/seeker-page-shell";
import { useApplication } from "@/hooks/use-applications";
import { useJob } from "@/hooks/use-jobs";
import { APPLICATION_STATUS_META, formatAppliedDate } from "@/lib/applications";
import { formatJobType, formatSalary } from "@/lib/jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ApplicationDetailBody() {
  const params = useParams<{ id: string }>();
  const { data: application, isLoading, isError } = useApplication(params.id);
  // The embedded job has no employer relation; the public job query fills the
  // company name (cached and shared with browse).
  const { data: publicJob } = useJob(application?.jobId ?? "");

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !application)
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load this application.
      </p>
    );

  const { job } = application;
  const meta = APPLICATION_STATUS_META[application.status];
  const salary = formatSalary(job);
  const companyName = publicJob?.employer?.companyName;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {companyName ? (
            <span className="inline-flex items-center gap-1">
              <Building2 className="size-4" aria-hidden />
              {companyName}
            </span>
          ) : null}
          {job.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" aria-hidden />
              {job.location}
            </span>
          ) : null}
          <span>{formatJobType(job.jobType)}</span>
          {salary ? <span className="font-medium text-foreground">{salary}</span> : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Applied {formatAppliedDate(application.createdAt)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your cover letter</CardTitle>
        </CardHeader>
        <CardContent>
          {application.coverLetter ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {application.coverLetter}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No cover letter was included.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Résumé</CardTitle>
        </CardHeader>
        <CardContent>
          {application.resumeUrl ? (
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground underline underline-offset-4"
            >
              View submitted résumé
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No résumé on file.</p>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" render={<Link href={`/jobs/${job.id}`} />}>
        View job posting
      </Button>
    </div>
  );
}

export default function ApplicationDetailPage() {
  return (
    <SeekerPageShell
      maxWidth="max-w-2xl"
      backHref="/seeker/applications"
      backLabel="Back to applications"
    >
      <ApplicationDetailBody />
    </SeekerPageShell>
  );
}
