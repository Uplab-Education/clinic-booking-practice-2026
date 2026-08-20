import { requireAdmin } from "@/auth/guards";
import { PageHeader } from "@/components/ui/page-header";
import { getDoctorById, listSpecialties } from "@/db/queries/doctors";
import { updateDoctorAction } from "../../actions";

type EditDoctorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditDoctorPage({
  params,
}: EditDoctorPageProps) {
  await requireAdmin();

  const { id } = await params;
  const doctorId = Number(id);

  const doctor = await getDoctorById(doctorId);
  const specialties = await listSpecialties();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Edit doctor"
        description="Update doctor information."
      />

     <form
  action={updateDoctorAction}
  className="mt-6 max-w-xl space-y-5 rounded-lg border border-slate-200 bg-white p-6">
   <input type="hidden" name="doctorId" value={doctor?.id} />
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
      defaultValue={doctor?.fullName}
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
    defaultValue={doctor?.specialtyId}
    required
    className="w-full rounded-md border border-slate-300 px-3 py-2"
  >
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
    defaultValue={doctor?.bio}
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
<button
  type="submit"
  className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
>
  Save changes
</button>
</form>
    </>
  );
}