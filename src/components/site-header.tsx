"use client";

import Link from "next/link";
import { Briefcase, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useActiveRole } from "@/components/profile/active-role-provider";
import { RoleSwitcher } from "@/components/profile/role-switcher";
import { Button } from "@/components/ui/button";

/** Primary top navigation shared across every page; auth-aware. */
export function SiteHeader() {
  const { session, user, loading, signOut } = useAuth();
  const { capabilities } = useActiveRole();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Briefcase className="size-5" aria-hidden />
          <span>Job Portal</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse jobs
          </Link>

          {loading ? null : session ? (
            <>
              <RoleSwitcher />
              <Link
                href="/dashboard"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              {capabilities.hasEmployer ? (
                <Link
                  href="/employer/jobs"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  My listings
                </Link>
              ) : null}
              {capabilities.hasJobSeeker ? (
                <Link
                  href="/seeker/applications"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  My applications
                </Link>
              ) : null}
              <span className="hidden text-muted-foreground sm:inline">
                {user?.email}
              </span>
              <Button size="sm" variant="outline" onClick={() => void signOut()}>
                <LogOut className="size-4" aria-hidden />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" render={<Link href="/login" />}>
                Sign in
              </Button>
              <Button size="sm" render={<Link href="/signup" />}>
                Sign up
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
