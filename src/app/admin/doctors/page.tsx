import { requireAdmin } from "@/auth/guards";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { listAllDoctors } from "@/db/queries/doctors";
import { toggleDoctorActiveAction } from "./actions";

export default async function AdminDoctorsPage() {
  await requireAdmin();

  const doctors = await listAllDoctors();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Doctors"
        description="Manage the clinic's doctors: add new ones, update details, and deactivate doctors who no longer accept patients."
      />

      <div className="mb-4">
        <Button asChild href="/admin/doctors/create">
          Add doctor
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Specialty</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {doctors.map((doctor) => (
              <tr
                key={doctor.id}
                className={`border-t border-slate-200 ${
                  doctor.isActive ? "" : "opacity-60"
                }`}
              >
                <td className="px-4 py-3">{doctor.fullName}</td>
                <td className="px-4 py-3">{doctor.specialty.name}</td>
                <td className="px-4 py-3">{doctor.room ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-slate-200 px-2 py-1 text-xs font-medium">
                    {doctor.isActive ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button asChild href={`/admin/doctors/${doctor.id}/edit`}>
                    Edit
                  </Button>
                  <form action={toggleDoctorActiveAction}>
                    <input type="hidden" name="doctorId" value={doctor.id} />
                    <input
                      type="hidden"
                      name="isActive"
                      value={String(doctor.isActive)}
                    />

                    <button
                      type="submit"
                      className="rounded-md border border-slate-300 px-3 py-1 text-sm"
                    >
                      {doctor.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
