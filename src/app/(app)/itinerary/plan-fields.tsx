"use client";

import { PLAN_CATEGORIES } from "@/lib/categories";
import { formatDay } from "@/lib/dates";

export type PlanValues = {
  title?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  category?: string;
};

export function PlanFields({ days, values = {} }: { days: string[]; values?: PlanValues }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="label-xs" htmlFor="title">
          What&apos;s happening
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={values.title}
          placeholder="Ryokan check-in"
          className="field mt-1.5"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-xs" htmlFor="day">
            Day
          </label>
          <select id="day" name="day" defaultValue={values.day ?? days[0]} className="field mt-1.5">
            {days.map((day) => (
              <option key={day} value={day}>
                {formatDay(new Date(`${day}T00:00:00.000Z`), "short")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-xs" htmlFor="category">
            Kind
          </label>
          <select
            id="category"
            name="category"
            defaultValue={values.category ?? "explore"}
            className="field mt-1.5"
          >
            {PLAN_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-xs" htmlFor="startTime">
            Starts
          </label>
          <input id="startTime" name="startTime" type="time" defaultValue={values.startTime} className="field mt-1.5" />
        </div>
        <div>
          <label className="label-xs" htmlFor="endTime">
            Ends (optional)
          </label>
          <input id="endTime" name="endTime" type="time" defaultValue={values.endTime} className="field mt-1.5" />
        </div>
      </div>

      <div>
        <label className="label-xs" htmlFor="location">
          Where
        </label>
        <input
          id="location"
          name="location"
          defaultValue={values.location}
          placeholder="Gion, Kyoto"
          className="field mt-1.5"
        />
      </div>

      <div>
        <label className="label-xs" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={values.notes}
          placeholder="Booking ref, who's bringing what, anything worth remembering."
          className="field mt-1.5 resize-y"
        />
      </div>
    </div>
  );
}
