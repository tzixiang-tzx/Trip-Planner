"use client";

import { useActionState } from "react";
import { register } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";

export function RegisterForm() {
  const [state, formAction] = useActionState(register, undefined);

  return (
    <form action={formAction} className="mt-7 space-y-4">
      <div>
        <label htmlFor="name" className="label-xs">
          Your name
        </label>
        <input id="name" name="name" required placeholder="Ada Lim" className="field mt-1.5" />
      </div>

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
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="field mt-1.5"
        />
      </div>

      <div>
        <label htmlFor="inviteCode" className="label-xs">
          Invite code <span className="normal-case">(optional)</span>
        </label>
        <input
          id="inviteCode"
          name="inviteCode"
          placeholder="KYOTO26"
          className="field mt-1.5 font-mono tracking-[0.2em] uppercase"
        />
        <p className="mt-2 text-xs text-muted">
          Have one? You&apos;ll go straight to the trip. Leave it blank and you can start your own.
        </p>
      </div>

      {state?.error && (
        <p className="rounded-xl border border-clay/30 bg-clay-soft px-3.5 py-2.5 text-sm text-clay">
          {state.error}
        </p>
      )}

      <SubmitButton className="btn btn-primary w-full" pendingLabel="Getting you in…">
        Create my account
      </SubmitButton>
    </form>
  );
}
