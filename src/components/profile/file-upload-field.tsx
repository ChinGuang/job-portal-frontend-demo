"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
} from "lucide-react";
import { validateFile, type UploadConfig } from "@/lib/uploads";
import { Button } from "@/components/ui/button";

interface UploadMutation {
  mutate: (file: File, options?: { onSuccess?: () => void }) => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: unknown;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

export function FileUploadField({
  config,
  currentUrl,
  preview,
  mutation,
  note,
}: {
  config: UploadConfig;
  currentUrl?: string | null;
  preview: "image" | "link";
  mutation: UploadMutation;
  note?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const onChoose = (chosen: File | null) => {
    setValidationError(null);
    if (!chosen) {
      setFile(null);
      return;
    }
    const result = validateFile(chosen, config);
    if (!result.ok) {
      setFile(null);
      setValidationError(result.message);
      return;
    }
    setFile(chosen);
  };

  const onUpload = () => {
    if (!file) return;
    mutation.mutate(file, {
      onSuccess: () => {
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
      },
    });
  };

  return (
    <div className="space-y-3">
      {currentUrl ? (
        preview === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt="Current logo"
            className="size-16 rounded-md border object-contain"
          />
        ) : (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-foreground underline underline-offset-4"
          >
            View current file
          </a>
        )
      ) : (
        <p className="text-sm text-muted-foreground">No file uploaded yet.</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        className="hidden"
        onChange={(e) => onChoose(e.target.files?.[0] ?? null)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" aria-hidden />
          Choose file
        </Button>

        {file ? (
          <span className="text-sm text-muted-foreground">
            {file.name} ({formatSize(file.size)})
          </span>
        ) : null}

        <Button
          type="button"
          size="sm"
          disabled={!file || mutation.isPending}
          onClick={onUpload}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Uploading…
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {config.typeLabel} · up to {Math.round(config.maxBytes / (1024 * 1024))}{" "}
        MB
        {note ? ` · ${note}` : ""}
      </p>

      {validationError ? (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="size-4" aria-hidden />
          {validationError}
        </p>
      ) : null}
      {mutation.isError ? (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="size-4" aria-hidden />
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Upload failed."}
        </p>
      ) : null}
      {mutation.isSuccess && !file ? (
        <p className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4" aria-hidden />
          Uploaded.
        </p>
      ) : null}
    </div>
  );
}
