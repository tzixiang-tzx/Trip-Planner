"use client";

import { useActionState, useState } from "react";
import { joinTrip, logout } from "@/actions/auth";
import { createTrip } from "@/actions/trip";
import { SubmitButton } from "@/components/submit-button";
import { TripFields } from "@/components/trip-fields";

export function StartPanels({ defaultToJoin }: { defaultToJoin: boolean }) {
  const [mode, setMode] = useState<"join" | "create">(defaultToJoin ? "join" : "create");
  const [joinState, joinAction] = useActionState(joinTrip, undefined);
  const [createState, createAction] = useActionState(createTrip, undefined);

  return (
    <>
      <div className="mt-8 flex gap-1.5 rounded-pill border border-line bg-paper/60 p-1.5">
        <button
          type="button"
          onClick={() => setMode("join")}
          className={`flex-1 rounded-pill px-4 py-2.5 text-sm font-medium transition ${
            mode === "join" ? "bg-ink text-paper" : "text-muted hover:text-ink"
          }`}
        >
          I have an invite code
        </button>
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`flex-1 rounded-pill px-4 py-2.5 text-sm font-medium transition ${
            mode === "create" ? "bg-ink text-paper" : "text-muted hover:text-ink"
          }`}
        >
          I&apos;m starting the trip
        </button>
      </div>

      {mode === "join" ? (
        <form action={joinAction} className="card mt-5 space-y-4 p-7">
          <div>
            <label className="label-xs" htmlFor="inviteCode">
              Invite code
            </label>
            <input
              id="inviteCode"
              name="inviteCode"
              required
              placeholder="AMALFI26"
              className="field mt-1.5 font-mono text-lg tracking-[0.25em] uppercase"
            />
            <p className="mt-2 text-xs text-muted">
              Whoever set the trip up can find this in the footer of any page.
            </p>
          </div>

          {joinState?.error && (
            <p className="rounded-xl border border-clay/30 bg-clay-soft px-3.5 py-2.5 text-sm text-clay">
              {joinState.error}
            </p>
          )}

          <SubmitButton className="btn btn-primary w-full" pendingLabel="Joining…">
            Join the trip
          </SubmitButton>
        </form>
      ) : (
        <form action={createAction} className="card mt-5 space-y-5 p-7">
          <TripFields />

          {createState?.error && (
            <p className="rounded-xl border border-clay/30 bg-clay-soft px-3.5 py-2.5 text-sm text-clay">
              {createState.error}
            </p>
          )}

          <SubmitButton className="btn btn-primary w-full" pendingLabel="Setting it up…">
            Create the trip
          </SubmitButton>

          <p className="text-center text-xs text-muted">
            You&apos;ll be the organiser. Share the invite code and everyone else can join.
          </p>
        </form>
      )}

      <form action={logout} className="mt-5 text-center">
        <button type="submit" className="text-xs text-muted transition hover:text-clay">
          Sign out instead
        </button>
      </form>
    </>
  );
}
