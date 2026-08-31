"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, MapPin } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { RequireSeeker } from "@/components/seeker/require-seeker";
import { useApplication } from "@/hooks/use-applications";
import { APPLICATION_STATUS_META } from "@/lib/applications";
import { formatJobType, formatSalary, LOCALE } from "@/lib/jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function appliedDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(LOCALE, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

function ApplicationDetailBody() {
  const params = useParams<{ id: string }>();
  const { data: application, isLoading, isError } = useApplication(params.id);

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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {job.employer?.companyName ? (
            <span className="inline-flex items-center gap-1">
              <Building2 className="size-4" aria-hidden />
              {job.employer.companyName}
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
          Applied {appliedDate(application.createdAt)}
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
    <RequireAuth>
      <RequireSeeker>
        <div className="mx-auto w-full max-w-2xl px-4 py-10">
          <Link
            href="/seeker/applications"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to applications
          </Link>
          <ApplicationDetailBody />
        </div>
      </RequireSeeker>
    </RequireAuth>
  );
}
