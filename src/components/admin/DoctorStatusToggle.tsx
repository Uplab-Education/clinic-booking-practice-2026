"use client";

import { toggleDoctorActiveAction } from "@/app/admin/doctors/actions";

type DoctorStatusToggleProps = {
  doctorId: number;
  fullName: string;
  isActive: boolean;
};

export function DoctorStatusToggle({
  doctorId,
  fullName,
  isActive,
}: DoctorStatusToggleProps) {
  return (
    <form
      action={toggleDoctorActiveAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          isActive
            ? `Deactivate ${fullName}?`
            : `Activate ${fullName}?`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="doctorId" value={doctorId} />
      <input
        type="hidden"
        name="isActive"
        value={String(isActive)}
      />

      <button
        type="submit"
        className="rounded-md border border-slate-300 px-3 py-1 text-sm"
      >
        {isActive ? "Deactivate" : "Activate"}
      </button>
    </form>
  );
}