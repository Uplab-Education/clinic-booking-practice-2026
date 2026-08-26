"use client";

import { useActionState } from "react";

import {
  clearScheduleEntryAction,
  saveScheduleEntryAction,
  type ScheduleActionState,
} from "@/app/admin/schedules/actions";
import { Button } from "@/components/ui/button";
import type { DoctorScheduleEntry } from "@/db/schema";

type ScheduleEditorProps = {
  doctorId: number;
  entries: DoctorScheduleEntry[];
};

const weekdays = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

const initialState: ScheduleActionState = {};

export function ScheduleEditor({
  doctorId,
  entries,
}: ScheduleEditorProps) {
  return (
    <div className="space-y-4">
      {weekdays.map((day) => {
        const entry = entries.find(
          (item) => item.weekday === day.value,
        );

        return (
          <ScheduleDayRow
            key={day.value}
            doctorId={doctorId}
            weekday={day.value}
            label={day.label}
            entry={entry}
          />
        );
      })}
    </div>
  );
}

type ScheduleDayRowProps = {
  doctorId: number;
  weekday: number;
  label: string;
  entry?: DoctorScheduleEntry;
};

function ScheduleDayRow({
  doctorId,
  weekday,
  label,
  entry,
}: ScheduleDayRowProps) {
  const [saveState, saveFormAction, savePending] = useActionState(
    saveScheduleEntryAction,
    initialState,
  );

  const [clearState, clearFormAction, clearPending] = useActionState(
    clearScheduleEntryAction,
    initialState,
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="font-medium text-slate-950">
          {label}
        </h2>

        {!entry ? (
          <p className="text-sm text-slate-500">
            Day off
          </p>
        ) : null}
      </div>

      <form action={saveFormAction}>
        <input
          type="hidden"
          name="doctorId"
          value={doctorId}
        />

        <input
          type="hidden"
          name="weekday"
          value={weekday}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label
              htmlFor={`startTime-${weekday}`}
              className="block text-sm font-medium text-slate-900"
            >
              Start time
            </label>

            <input
              id={`startTime-${weekday}`}
              type="time"
              name="startTime"
              defaultValue={entry?.startTime.slice(0, 5) ?? "09:00"}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`endTime-${weekday}`}
              className="block text-sm font-medium text-slate-900"
            >
              End time
            </label>

            <input
              id={`endTime-${weekday}`}
              type="time"
              name="endTime"
              defaultValue={entry?.endTime.slice(0, 5) ?? "17:00"}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`slotMinutes-${weekday}`}
              className="block text-sm font-medium text-slate-900"
            >
              Slot length
            </label>

            <select
              id={`slotMinutes-${weekday}`}
              name="slotMinutes"
              defaultValue={entry?.slotMinutes ?? 30}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              disabled={savePending || clearPending}
            >
              {savePending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </form>

      {entry ? (
        <form
          action={clearFormAction}
          className="mt-3"
          onSubmit={(event) => {
            if (!window.confirm(`Clear ${label} schedule?`)) {
              event.preventDefault();
            }
          }}
        >
          <input
            type="hidden"
            name="doctorId"
            value={doctorId}
          />

          <input
            type="hidden"
            name="weekday"
            value={weekday}
          />

          <Button
            type="submit"
            variant="secondary"
            disabled={savePending || clearPending}
          >
            {clearPending ? "Clearing..." : "Clear"}
          </Button>
        </form>
      ) : null}

      <div
        className="mt-3 text-sm"
        aria-live="polite"
      >
        {saveState.error ? (
          <p className="text-red-600">
            {saveState.error}
          </p>
        ) : null}

        {saveState.success ? (
          <p className="text-green-700">
            {saveState.success}
          </p>
        ) : null}

        {clearState.error ? (
          <p className="text-red-600">
            {clearState.error}
          </p>
        ) : null}

        {clearState.success ? (
          <p className="text-green-700">
            {clearState.success}
          </p>
        ) : null}
      </div>
    </div>
  );
}