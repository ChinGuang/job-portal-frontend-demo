"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SignupForm() {
  const { signUp, isConfigured } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    const result = await signUp(email, password);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else if (result.needsConfirmation) {
      setConfirmationSent(true);
      setSubmitting(false);
    } else {
      router.replace("/dashboard");
    }
  };

  if (confirmationSent) {
    return (
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <MailCheck className="size-8 text-foreground" aria-hidden />
          <CardTitle className="mt-2">Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to {email}. Confirm your address, then
            sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" render={<Link href="/login" />}>
            Go to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Sign up to apply for jobs or post listings.</CardDescription>
      </CardHeader>
      <CardContent>
        {!isConfigured ? (
          <p className="text-sm text-destructive">
            Authentication is not configured. Set the Supabase environment
            variables to enable sign up.
          </p>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="text-sm font-medium">
                Confirm password
              </label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account…" : "Sign up"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-foreground underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
