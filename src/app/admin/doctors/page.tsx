import { requireAdmin } from "@/auth/guards";
import { DoctorStatusToggle } from "@/components/admin/DoctorStatusToggle";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listAllDoctors } from "@/db/queries/doctors";

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
      {doctors.length === 0 ? (
        <EmptyState
          title="No doctors yet"
          description="Add a doctor to start managing the clinic team."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Specialty</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Phone</th>
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

                  <td className="px-4 py-3">{doctor.phone ?? "—"}</td>

                  <td className="px-4 py-3">
                    <span className="rounded-full border border-slate-200 px-2 py-1 text-xs font-medium">
                      {doctor.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button asChild href={`/admin/doctors/${doctor.id}/edit`}>
                        Edit
                      </Button>

                      <DoctorStatusToggle
                        doctorId={doctor.id}
                        fullName={doctor.fullName}
                        isActive={doctor.isActive}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
