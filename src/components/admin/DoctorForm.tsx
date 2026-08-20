"use client";

import { useActionState } from "react";

import {
  createDoctorAction,
  updateDoctorAction,
  type DoctorFormState,
} from "@/app/admin/doctors/actions";

import type { Doctor, Specialty } from "@/db/schema";

type DoctorFormProps = {
  specialties: Specialty[];
  doctor?: Doctor;
};

const initialState: DoctorFormState = {};

export function DoctorForm({ specialties, doctor }: DoctorFormProps) {
  const action = doctor ? updateDoctorAction : createDoctorAction;

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="mt-6 max-w-xl space-y-5 rounded-lg border border-slate-200 bg-white p-6"
    >
      {doctor && <input type="hidden" name="doctorId" value={doctor.id} />}
      {state.form && (
        <p className="text-sm text-red-600" aria-live="polite">
          {state.form}
        </p>
      )}

      <div className="space-y-2">
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-slate-900"
        >
          Full name
        </label>

        <input
          id="fullName"
          name="fullName"
          defaultValue={doctor?.fullName ?? ""}
          aria-describedby={
            state.errors?.fullName ? "fullName-error" : undefined
          }
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />

        {state.errors?.fullName && (
          <p id="fullName-error" className="text-sm text-red-600">
            {state.errors.fullName}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="specialtyId"
          className="block text-sm font-medium text-slate-900"
        >
          Specialty
        </label>

        <select
          id="specialtyId"
          name="specialtyId"
          defaultValue={doctor?.specialtyId ?? ""}
          aria-describedby={
            state.errors?.specialtyId ? "specialtyId-error" : undefined
          }
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="">Select specialty</option>

          {specialties.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.name}
            </option>
          ))}
        </select>

        {state.errors?.specialtyId && (
          <p id="specialtyId-error" className="text-sm text-red-600">
            {state.errors.specialtyId}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-slate-900"
        >
          Bio
        </label>

        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={doctor?.bio ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="room"
          className="block text-sm font-medium text-slate-900"
        >
          Room
        </label>

        <input
          id="room"
          name="room"
          defaultValue={doctor?.room ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div aria-live="polite">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving..." : doctor ? "Save changes" : "Create doctor"}
        </button>
      </div>
    </form>
  );
}
