"use client";

import { useActionState } from "react";

import {
  createDoctorAction,
  updateDoctorAction,
  type DoctorFormState,
} from "@/app/admin/doctors/actions";

import { formatPhoneNumber } from "@/lib/phone";

import type { Doctor, Specialty } from "@/db/schema";

type DoctorFormProps = {
  specialties: Specialty[];
  doctor?: Doctor;
};

const initialState: DoctorFormState = {};

export function DoctorForm({ specialties, doctor }: DoctorFormProps) {
  const action = doctor ? updateDoctorAction : createDoctorAction;

  const [state, formAction, pending] = useActionState(action, initialState);

  // The stored phone is digits only, so show it the same way the doctors table
  // and the public profile do. What the admin typed wins over it after an error.
  const phoneValue =
    state.values?.phone ??
    (doctor?.phone ? formatPhoneNumber(doctor.phone) : "");

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
          key={`fullName-${state.values?.fullName ?? doctor?.fullName ?? ""}`}
          id="fullName"
          name="fullName"
          defaultValue={state.values?.fullName ?? doctor?.fullName ?? ""}
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
          key={`specialty-${state.values?.specialtyId ?? doctor?.specialtyId ?? ""}`}
          id="specialtyId"
          name="specialtyId"
          defaultValue={
            state.values?.specialtyId ?? doctor?.specialtyId ?? ""
          }
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
          key={`bio-${state.values?.bio ?? doctor?.bio ?? ""}`}
          id="bio"
          name="bio"
          rows={4}
          defaultValue={state.values?.bio ?? doctor?.bio ?? ""}
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
          key={`room-${state.values?.room ?? doctor?.room ?? ""}`}
          id="room"
          name="room"
          defaultValue={state.values?.room ?? doctor?.room ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-slate-900"
        >
          Phone
        </label>

        <input
          key={`phone-${phoneValue}`}
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phoneValue}
          placeholder="+380 (44) 123-45-67"
          aria-describedby={state.errors?.phone ? "phone-error" : undefined}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />

        {state.errors?.phone && (
          <p id="phone-error" className="text-sm text-red-600">
            {state.errors.phone}
          </p>
        )}
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