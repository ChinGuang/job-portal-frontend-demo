"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmployerForm } from "@/components/profile/employer-form";
import { useEmployerProfile } from "@/hooks/use-profiles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function EmployerProfileContent() {
  const { data: profile, isLoading, isError, error } = useEmployerProfile();
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
            <EmployerForm profile={profile ?? null} />
          )}
        </CardContent>
      </Card>
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
