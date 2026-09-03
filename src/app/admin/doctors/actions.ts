"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/auth/guards";
import {
  createDoctor,
  listSpecialties,
  setDoctorActive,
  updateDoctor,
} from "@/db/queries/doctors";

import type { Specialty } from "@/db/schema";

export type DoctorFormState = {
  errors?: {
    fullName?: string;
    specialtyId?: string;
    phone?: string;
  };
  form?: string;
};

type ParsedDoctorForm =
  | {
      success: true;
      values: {
        fullName: string;
        specialtyId: number;
        bio: string;
        room: string | null;
        phone: string | null;
      };
    }
  | {
      success: false;
      errors: NonNullable<DoctorFormState["errors"]>;
    };

function parseDoctorId(value: FormDataEntryValue | null) {
  const doctorId = Number(value);

  if (!Number.isInteger(doctorId) || doctorId <= 0) {
    return null;
  }

  return doctorId;
}

function parseDoctorForm(
  formData: FormData,
  specialties: Specialty[],
): ParsedDoctorForm {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const specialtyId = Number(formData.get("specialtyId"));
  const bio = String(formData.get("bio") ?? "").trim();
  const roomValue = String(formData.get("room") ?? "").trim();
  const room = roomValue === "" ? null : roomValue;
  const phoneValue = String(formData.get("phone") ?? "").trim();
  const phone = phoneValue === "" ? null : phoneValue.replace(/\s+/g, "");

  const errors: NonNullable<DoctorFormState["errors"]> = {};

  if (!fullName) {
    errors.fullName = "Full name is required.";
  }

  const specialtyExists = specialties.some(
    (specialty) => specialty.id === specialtyId,
  );

  if (!specialtyExists) {
    errors.specialtyId = "Please select a valid specialty.";
  }

  if (phone !== null && !/^\+?\d{9,15}$/.test(phone)) {
    errors.phone = "Phone must contain 9 to 15 digits and may start with +.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    values: {
      fullName,
      specialtyId,
      bio,
      room,
      phone,
    },
  };
}

export async function createDoctorAction(
  _prevState: DoctorFormState,
  formData: FormData,
): Promise<DoctorFormState> {
  await requireAdmin();

  const specialties = await listSpecialties();
  const parsed = parseDoctorForm(formData, specialties);

  if (!parsed.success) {
    return {
      errors: parsed.errors,
    };
  }

  await createDoctor(parsed.values);

  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");

  redirect("/admin/doctors");
}

export async function toggleDoctorActiveAction(formData: FormData) {
  await requireAdmin();

  const doctorId = parseDoctorId(formData.get("doctorId"));
  const isActive = String(formData.get("isActive")) === "true";

  if (doctorId === null) {
    return;
  }

  const doctor = await setDoctorActive(doctorId, !isActive);

  if (!doctor) {
    return;
  }

  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");

  redirect("/admin/doctors");
}

export async function updateDoctorAction(
  _prevState: DoctorFormState,
  formData: FormData,
): Promise<DoctorFormState> {
  await requireAdmin();

  const doctorId = parseDoctorId(formData.get("doctorId"));

  if (doctorId === null) {
    return {
      form: "Doctor was not found.",
    };
  }

  const specialties = await listSpecialties();
  const parsed = parseDoctorForm(formData, specialties);

  if (!parsed.success) {
    return {
      errors: parsed.errors,
    };
  }

  const doctor = await updateDoctor(doctorId, parsed.values);

  if (!doctor) {
    return {
      form: "Doctor was not found.",
    };
  }

  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");

  redirect("/admin/doctors");
}
