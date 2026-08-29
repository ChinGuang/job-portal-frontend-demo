"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { FileUploadField } from "@/components/profile/file-upload-field";
import { JobSeekerForm } from "@/components/profile/job-seeker-form";
import { useJobSeekerProfile } from "@/hooks/use-profiles";
import { useUploadResume } from "@/hooks/use-uploads";
import { RESUME_UPLOAD } from "@/lib/uploads";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function JobSeekerProfileContent() {
  const router = useRouter();
  const { data: profile, isLoading, isError, error } = useJobSeekerProfile();
  const uploadResume = useUploadResume();
  const exists = Boolean(profile);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>
            {exists ? "Edit job-seeker profile" : "Create job-seeker profile"}
          </CardTitle>
          <CardDescription>
            Build your profile to apply for jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Couldn't load your profile."}
            </p>
          ) : (
            <JobSeekerForm
              profile={profile ?? null}
              onSaved={() => router.push("/dashboard")}
            />
          )}
        </CardContent>
      </Card>

      {exists ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Résumé</CardTitle>
            <CardDescription>
              Attach a résumé so employers can review your background.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadField
              config={RESUME_UPLOAD}
              preview="link"
              currentUrl={profile?.resumeUrl}
              mutation={uploadResume}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export default function JobSeekerProfilePage() {
  return (
    <RequireAuth>
      <JobSeekerProfileContent />
    </RequireAuth>
  );
}
