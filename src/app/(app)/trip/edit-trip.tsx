"use client";

import { useActionState } from "react";
import { updateTrip } from "@/actions/trip";
import { SubmitButton } from "@/components/submit-button";
import { TripFields, type TripValues } from "@/components/trip-fields";

export function EditTrip({ values }: { values: TripValues }) {
  const [state, formAction] = useActionState(updateTrip, undefined);

  return (
    <form action={formAction} className="card space-y-5 p-6">
      <TripFields values={values} />

      {state?.error && (
        <p className="rounded-xl border border-clay/30 bg-clay-soft px-3.5 py-2.5 text-sm text-clay">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
        <p className="text-xs text-muted">
          Changing the currency relabels amounts — it doesn&apos;t convert what&apos;s already recorded.
        </p>
        <SubmitButton pendingLabel="Saving…">Save details</SubmitButton>
      </div>
    </form>
  );
}
