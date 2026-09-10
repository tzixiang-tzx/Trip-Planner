"use client";

import { CURRENCIES } from "@/lib/money";

export type TripValues = {
  name?: string;
  destination?: string;
  blurb?: string;
  startDate?: string;
  endDate?: string;
  currency?: string;
  inviteCode?: string;
};

/** Suggests something like ROME26 from the destination, as a starting point. */
function suggestCode(destination: string): string {
  const word = destination.split(/[\s,]+/).filter(Boolean)[0] ?? "TRIP";
  const year = String(new Date().getFullYear()).slice(2);
  return (word.replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase() || "TRIP") + year;
}

export function TripFields({ values = {} }: { values?: TripValues }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="label-xs" htmlFor="name">
          Trip name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={values.name}
          placeholder="Amalfi, finally"
          className="field mt-1.5"
        />
      </div>

      <div>
        <label className="label-xs" htmlFor="destination">
          Where to
        </label>
        <input
          id="destination"
          name="destination"
          required
          defaultValue={values.destination}
          placeholder="Amalfi Coast, Italy"
          className="field mt-1.5"
          onChange={(e) => {
            const code = document.getElementById("inviteCode") as HTMLInputElement | null;
            if (code && !code.dataset.touched) code.value = suggestCode(e.target.value);
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-xs" htmlFor="startDate">
            First day
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={values.startDate}
            className="field mt-1.5"
          />
        </div>
        <div>
          <label className="label-xs" htmlFor="endDate">
            Last day
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            required
            defaultValue={values.endDate}
            className="field mt-1.5"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-xs" htmlFor="currency">
            Currency for costs
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={values.currency ?? "SGD"}
            className="field mt-1.5"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-xs" htmlFor="inviteCode">
            Invite code
          </label>
          <input
            id="inviteCode"
            name="inviteCode"
            required
            maxLength={12}
            defaultValue={values.inviteCode}
            onInput={(e) => {
              e.currentTarget.dataset.touched = "1";
            }}
            placeholder="AMALFI26"
            className="field mt-1.5 font-mono tracking-[0.2em] uppercase"
          />
        </div>
      </div>

      <div>
        <label className="label-xs" htmlFor="blurb">
          A line about it (optional)
        </label>
        <input
          id="blurb"
          name="blurb"
          defaultValue={values.blurb}
          placeholder="Ten days, no alarms."
          className="field mt-1.5"
        />
      </div>
    </div>
  );
}
