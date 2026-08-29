"use client";

import Link from "next/link";
import { Briefcase, CheckCircle2, Circle, UserRound } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAuth } from "@/components/auth/auth-provider";
import { useMe } from "@/hooks/use-me";
import { deriveCapabilities } from "@/lib/me";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProfileStatusCard({
  icon: Icon,
  title,
  description,
  exists,
  loading,
  href,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  exists: boolean;
  loading: boolean;
  href: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Icon className="size-6 text-muted-foreground" aria-hidden />
          {loading ? (
            <Skeleton className="h-5 w-20" />
          ) : exists ? (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="size-3.5" aria-hidden />
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Circle className="size-3.5" aria-hidden />
              Not set up
            </Badge>
          )}
        </div>
        <CardTitle className="mt-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <Button
            variant={exists ? "outline" : "default"}
            render={<Link href={href} />}
          >
            {exists ? "Manage profile" : "Create profile"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { data: me, isLoading, isError, error } = useMe();
  const capabilities = deriveCapabilities(me);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your profiles and activity.
        </p>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-40" />
            </>
          ) : (
            <>
              <p>
                <span className="text-muted-foreground">Email: </span>
                {me?.email ?? user?.email ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Provider: </span>
                {me?.provider ?? "SUPABASE"}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {isError ? (
        <div className="mb-8 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">
            Couldn&apos;t load your profile status
          </p>
          <p className="mt-1 text-muted-foreground">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      ) : null}

      <h2 className="mb-4 text-lg font-semibold">Your profiles</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileStatusCard
          icon={UserRound}
          title="Job seeker"
          description="Build a profile, upload a résumé, and apply to jobs."
          exists={capabilities.hasJobSeeker}
          loading={isLoading}
          href="/profile/job-seeker"
        />
        <ProfileStatusCard
          icon={Briefcase}
          title="Employer"
          description="Create a company profile and post job listings."
          exists={capabilities.hasEmployer}
          loading={isLoading}
          href="/profile/employer"
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
