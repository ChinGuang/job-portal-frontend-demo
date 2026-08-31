"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { getApplicationResumeUrl } from "@/lib/applicant-review";
import { Button } from "@/components/ui/button";

/**
 * Opens an applicant's résumé via a freshly-minted short-lived signed URL.
 * A blank tab is opened synchronously (before the await) so the browser's
 * popup blocker treats it as user-initiated, then redirected once the URL
 * resolves.
 */
export function ResumeButton({ applicationId }: { applicationId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setError(null);
    setPending(true);
    const tab = window.open("about:blank", "_blank");
    try {
      const { resumeUrl } = await getApplicationResumeUrl(applicationId);
      if (tab) tab.location.href = resumeUrl;
      else window.location.href = resumeUrl;
    } catch {
      tab?.close();
      setError("Couldn't open résumé. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-1">
      <Button size="sm" variant="outline" disabled={pending} onClick={onClick}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <FileText className="size-4" aria-hidden />
        )}
        View résumé
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
