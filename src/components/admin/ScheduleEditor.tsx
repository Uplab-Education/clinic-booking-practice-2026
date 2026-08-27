"use client";

import { useActionState, useMemo, useState } from "react";

import {
  clearScheduleEntryAction,
  saveScheduleEntryAction,
  type ScheduleActionState,
} from "@/app/admin/schedules/actions";
import type { DoctorScheduleEntry } from "@/db/schema";
import { generateSlotTimes } from "@/lib/availability";

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
            key={`${doctorId}-${day.value}-${entry?.startTime ?? "off"}-${entry?.endTime ?? "off"}-${entry?.slotMinutes ?? "off"}`}
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
  const storedWorking = Boolean(entry);

  const storedStartTime = entry?.startTime.slice(0, 5) ?? "09:00";
  const storedEndTime = entry?.endTime.slice(0, 5) ?? "17:00";
  const storedSlotMinutes = entry?.slotMinutes ?? 30;

  const [working, setWorking] = useState(storedWorking);
  const [startTime, setStartTime] = useState(storedStartTime);
  const [endTime, setEndTime] = useState(storedEndTime);
  const [slotMinutes, setSlotMinutes] = useState(storedSlotMinutes);

  const [saveState, saveAction, savePending] = useActionState(
    saveScheduleEntryAction,
    initialState,
  );

  const [clearState, clearAction, clearPending] = useActionState(
    clearScheduleEntryAction,
    initialState,
  );

  const generatedSlots = useMemo(() => {
    if (!working) {
      return [];
    }

    try {
      return generateSlotTimes(
        startTime,
        endTime,
        slotMinutes,
      );
    } catch {
      return [];
    }
  }, [working, startTime, endTime, slotMinutes]);

  const hasChanges =
    working !== storedWorking ||
    (working &&
      (startTime !== storedStartTime ||
        endTime !== storedEndTime ||
        slotMinutes !== storedSlotMinutes));

  const pending = savePending || clearPending;

  function handleWorkingChange(nextWorking: boolean) {
    if (nextWorking === working) {
      return;
    }

    if (!nextWorking && storedWorking) {
      const confirmed = window.confirm(
        `Set ${label} as a day off? This removes the stored working hours for this day. Existing appointments will not be changed.`,
      );

      if (!confirmed) {
        return;
      }

      const formData = new FormData();
      formData.set("doctorId", String(doctorId));
      formData.set("weekday", String(weekday));

      clearAction(formData);
      setWorking(false);
      return;
    }

    setWorking(nextWorking);
  }

  const resultState = clearState.error || clearState.success
    ? clearState
    : saveState;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-medium text-slate-950">
            {label}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {working
              ? "The doctor takes appointments this day."
              : "The doctor takes no appointments this day."}
          </p>
        </div>

        <div
          className="inline-flex w-full rounded-md border border-slate-300 p-1 sm:w-auto"
          aria-label={`${label} schedule status`}
        >
          <button
            type="button"
            disabled={pending}
            aria-pressed={working}
            onClick={() => handleWorkingChange(true)}
            className={`flex-1 rounded px-3 py-2 text-sm font-medium sm:flex-none ${
              working
                ? "bg-slate-950 text-white"
                : "text-slate-700 hover:bg-slate-50"
            } disabled:opacity-50`}
          >
            Working
          </button>

          <button
            type="button"
            disabled={pending}
            aria-pressed={!working}
            onClick={() => handleWorkingChange(false)}
            className={`flex-1 rounded px-3 py-2 text-sm font-medium sm:flex-none ${
              !working
                ? "bg-slate-950 text-white"
                : "text-slate-700 hover:bg-slate-50"
            } disabled:opacity-50`}
          >
            Day off
          </button>
        </div>
      </div>

      {working && (
        <form
          action={saveAction}
          className="mt-5"
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

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label
                htmlFor={`startTime-${doctorId}-${weekday}`}
                className="block text-sm font-medium text-slate-900"
              >
                Start time
              </label>

              <input
                id={`startTime-${doctorId}-${weekday}`}
                type="time"
                name="startTime"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="w-full min-w-0 rounded-md border border-slate-300 px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`endTime-${doctorId}-${weekday}`}
                className="block text-sm font-medium text-slate-900"
              >
                End time
              </label>

              <input
                id={`endTime-${doctorId}-${weekday}`}
                type="time"
                name="endTime"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="w-full min-w-0 rounded-md border border-slate-300 px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`slotMinutes-${doctorId}-${weekday}`}
                className="block text-sm font-medium text-slate-900"
              >
                Slot length
              </label>

              <select
                id={`slotMinutes-${doctorId}-${weekday}`}
                name="slotMinutes"
                value={slotMinutes}
                onChange={(event) =>
                  setSlotMinutes(Number(event.target.value))
                }
                className="w-full min-w-0 rounded-md border border-slate-300 px-3 py-2"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm">
            {generatedSlots.length > 0 ? (
              <p className="text-slate-600">
                This window produces{" "}
                <strong>{generatedSlots.length}</strong>{" "}
                appointment{" "}
                {generatedSlots.length === 1 ? "slot" : "slots"}.
              </p>
            ) : (
              <p className="text-red-600">
                This window produces no bookable appointment slots.
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={
                pending ||
                !hasChanges ||
                generatedSlots.length === 0
              }
              className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {savePending ? `Saving ${label}...` : `Save ${label}`}
            </button>

            {!hasChanges && (
              <p className="text-sm text-slate-500">
                This schedule matches the saved schedule.
              </p>
            )}
          </div>
        </form>
      )}

      <div
        className="mt-3 text-sm"
        aria-live="polite"
      >
        {resultState.error && (
          <p className="text-red-600">
            {resultState.error}
          </p>
        )}

        {resultState.success && (
          <p className="text-green-700">
            {resultState.success}
          </p>
        )}
      </div>
    </section>
  );
}