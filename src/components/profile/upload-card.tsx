"use client";

import type { UploadConfig } from "@/lib/uploads";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUploadField } from "./file-upload-field";

interface UploadMutation {
  mutate: (file: File, options?: { onSuccess?: () => void }) => void;
  reset: () => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: unknown;
}

/** A titled card wrapping a {@link FileUploadField}, shared by the profile pages. */
export function UploadCard({
  title,
  description,
  config,
  preview,
  currentUrl,
  mutation,
  note,
}: {
  title: string;
  description: string;
  config: UploadConfig;
  preview: "image" | "link";
  currentUrl?: string | null;
  mutation: UploadMutation;
  note?: string;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <FileUploadField
          config={config}
          preview={preview}
          currentUrl={currentUrl}
          mutation={mutation}
          note={note}
        />
      </CardContent>
    </Card>
  );
}
