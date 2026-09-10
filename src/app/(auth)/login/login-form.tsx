"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm() {
  const [state, formAction] = useActionState(login, undefined);

  return (
    <form action={formAction} className="mt-7 space-y-4">
      <div>
        <label htmlFor="email" className="label-xs">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="field mt-1.5"
        />
      </div>

      <div>
        <label htmlFor="password" className="label-xs">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="field mt-1.5"
        />
      </div>

      {state?.error && (
        <p className="rounded-xl border border-clay/30 bg-clay-soft px-3.5 py-2.5 text-sm text-clay">
          {state.error}
        </p>
      )}

      <SubmitButton className="btn btn-primary w-full" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
