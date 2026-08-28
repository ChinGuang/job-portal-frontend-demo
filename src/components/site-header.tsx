import Link from "next/link";
import { Briefcase } from "lucide-react";

/** Primary top navigation shared across every page. */
export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Briefcase className="size-5" aria-hidden />
          <span>Job Portal</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Browse jobs
          </Link>
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
