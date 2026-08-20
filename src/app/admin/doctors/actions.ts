"use server";

import { redirect } from "next/navigation";

import {
  createDoctor,
  listSpecialties,
  setDoctorActive,
  updateDoctor,
} from "@/db/queries/doctors";

export type DoctorFormState = {
  errors?: {
    fullName?: string;
    specialtyId?: string;
  };
};

export async function createDoctorAction(
  _prevState: DoctorFormState,
  formData: FormData,
): Promise<DoctorFormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const specialtyId = Number(formData.get("specialtyId"));
  const bio = String(formData.get("bio") ?? "").trim();
  const roomValue = String(formData.get("room") ?? "").trim();
  const room = roomValue === "" ? null : roomValue;

  const errors: DoctorFormState["errors"] = {};

  if (!fullName) {
    errors.fullName = "Full name is required.";
  }

  const specialties = await listSpecialties();

  const specialtyExists = specialties.some(
    (specialty) => specialty.id === specialtyId,
  );

  if (!specialtyExists) {
    errors.specialtyId = "Please select a valid specialty.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  await createDoctor({
    fullName,
    specialtyId,
    bio,
    room,
  });

  redirect("/admin/doctors");
}

export async function toggleDoctorActiveAction(formData: FormData) {
  const doctorId = Number(formData.get("doctorId"));
  const isActive = String(formData.get("isActive")) === "true";

  if (!doctorId) {
    return;
  }

  await setDoctorActive(doctorId, !isActive);

  redirect("/admin/doctors");
}

export async function updateDoctorAction(
  _prevState: DoctorFormState,
  formData: FormData,
): Promise<DoctorFormState> {
  const doctorId = Number(formData.get("doctorId"));
  const fullName = String(formData.get("fullName") ?? "").trim();
  const specialtyId = Number(formData.get("specialtyId"));
  const bio = String(formData.get("bio") ?? "").trim();
  const roomValue = String(formData.get("room") ?? "").trim();
  const room = roomValue === "" ? null : roomValue;

  const errors: DoctorFormState["errors"] = {};

  if (!doctorId) {
    return {
      errors: {
        fullName: "Doctor was not found.",
      },
    };
  }

  if (!fullName) {
    errors.fullName = "Full name is required.";
  }

  const specialties = await listSpecialties();

  const specialtyExists = specialties.some(
    (specialty) => specialty.id === specialtyId,
  );

  if (!specialtyExists) {
    errors.specialtyId = "Please select a valid specialty.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  await updateDoctor(doctorId, {
    fullName,
    specialtyId,
    bio,
    room,
  });

  redirect("/admin/doctors");
}