import { Button } from "@/components/ui/button";

/** Shared error / success / submit footer for the profile create-edit forms. */
export function ProfileFormFooter({
  fieldError,
  saveError,
  isError,
  isSuccess,
  isPending,
  exists,
}: {
  fieldError: string | null;
  saveError: unknown;
  isError: boolean;
  isSuccess: boolean;
  isPending: boolean;
  exists: boolean;
}) {
  return (
    <>
      {fieldError ? (
        <p className="text-sm text-destructive">{fieldError}</p>
      ) : null}
      {isError ? (
        <p className="text-sm text-destructive">
          {saveError instanceof Error ? saveError.message : "Couldn't save."}
        </p>
      ) : null}
      {isSuccess ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Profile saved.
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : exists ? "Save changes" : "Create profile"}
      </Button>
    </>
  );
}
