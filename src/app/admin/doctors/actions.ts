"use server";

import { redirect } from "next/navigation";
import {
  createDoctor,
  listSpecialties,
  setDoctorActive,
  updateDoctor,
} from "@/db/queries/doctors";

export async function createDoctorAction(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const specialtyId = Number(formData.get("specialtyId"));
  const bio = String(formData.get("bio") ?? "").trim();
  const roomValue = String(formData.get("room") ?? "").trim();

  const room = roomValue === "" ? null : roomValue;

  if (!fullName) {
  return;
}

  const specialties = await listSpecialties();

  const specialtyExists = specialties.some(
    (specialty) => specialty.id === specialtyId,
  );

  if (!specialtyExists) {
  return;
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

export async function updateDoctorAction(formData: FormData) {
  const doctorId = Number(formData.get("doctorId"));
  const fullName = String(formData.get("fullName") ?? "").trim();
  const specialtyId = Number(formData.get("specialtyId"));
  const bio = String(formData.get("bio") ?? "").trim();
  const roomValue = String(formData.get("room") ?? "").trim();
  const room = roomValue === "" ? null : roomValue;

  if (!doctorId || !fullName) {
    return;
  }

  const specialties = await listSpecialties();

  const specialtyExists = specialties.some(
    (specialty) => specialty.id === specialtyId,
  );

  if (!specialtyExists) {
    return;
  }

  await updateDoctor(doctorId, {
    fullName,
    specialtyId,
    bio,
    room,
  });

  redirect("/admin/doctors");
}