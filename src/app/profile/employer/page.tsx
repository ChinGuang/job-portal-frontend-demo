"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmployerForm } from "@/components/profile/employer-form";
import { FileUploadField } from "@/components/profile/file-upload-field";
import { useEmployerProfile } from "@/hooks/use-profiles";
import { useUploadLogo } from "@/hooks/use-uploads";
import { LOGO_UPLOAD } from "@/lib/uploads";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function EmployerProfileContent() {
  const router = useRouter();
  const { data: profile, isLoading, isError, error } = useEmployerProfile();
  const uploadLogo = useUploadLogo();
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
            {exists ? "Edit employer profile" : "Create employer profile"}
          </CardTitle>
          <CardDescription>
            Set up your company to post job listings.
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
            <EmployerForm
              profile={profile ?? null}
              onSaved={() => router.push("/dashboard")}
            />
          )}
        </CardContent>
      </Card>

      {exists ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Company logo</CardTitle>
            <CardDescription>
              Upload a logo to display on your listings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadField
              config={LOGO_UPLOAD}
              preview="image"
              currentUrl={profile?.logoUrl}
              mutation={uploadLogo}
              note="backend endpoint pending"
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export default function EmployerProfilePage() {
  return (
    <RequireAuth>
      <EmployerProfileContent />
    </RequireAuth>
  );
}
