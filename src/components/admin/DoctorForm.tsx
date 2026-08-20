"use client";

import { createDoctorAction } from "@/app/admin/doctors/actions";
import type { Specialty } from "@/db/schema";

type DoctorFormProps = {
  specialties: Specialty[];
};

export function DoctorForm({ specialties }: DoctorFormProps) {
  return (
    <form
  action={createDoctorAction}
  className="mt-6 max-w-xl space-y-5 rounded-lg border border-slate-200 bg-white p-6"> 
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
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
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
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="">Select specialty</option>

          {specialties.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.name}
            </option>
          ))}
        </select>
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
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
      >
        Create doctor
      </button>
    </form>
  );
}
