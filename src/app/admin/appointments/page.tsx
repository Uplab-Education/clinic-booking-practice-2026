import { requireAdmin } from "@/auth/guards";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { listAllAppointments } from "@/db/queries/appointments";
import { listAllDoctors } from "@/db/queries/doctors";
import { clinicDateIso, formatAppointmentTime } from "@/lib/availability";

type AdminAppointmentsPageProps = {
  searchParams: Promise<{
    doctorId?: string;
    status?: string;
  }>;
};

export default async function AdminAppointmentsPage({
  searchParams,
}: AdminAppointmentsPageProps) {
  await requireAdmin();

  const params = await searchParams;

  const doctorIdValue = Number(params.doctorId);

  const [allAppointments, doctors] = await Promise.all([
    listAllAppointments(),
    listAllDoctors(),
  ]);

  const doctorId =
    Number.isInteger(doctorIdValue) &&
    doctorIdValue > 0 &&
    doctors.some((doctor) => doctor.id === doctorIdValue)
      ? doctorIdValue
      : undefined;

  const status =
    params.status === "booked" || params.status === "cancelled"
      ? params.status
      : undefined;

  const filteredAppointments = allAppointments.filter(
    (appointment) =>
      (doctorId === undefined || appointment.doctor.id === doctorId) &&
      (status === undefined || appointment.status === status),
  );

  const todayIso = clinicDateIso(new Date());

  const booked = allAppointments.filter(
    (appointment) => appointment.status === "booked",
  ).length;

  const cancelled = allAppointments.filter(
    (appointment) => appointment.status === "cancelled",
  ).length;

  const today = allAppointments.filter(
    (appointment) =>
      appointment.status === "booked" &&
      clinicDateIso(appointment.startsAt) === todayIso,
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Appointments"
        description="All appointments across the clinic with filters by doctor and status."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Booked" value={String(booked)} helper="All time" />

        <StatCard
          label="Cancelled"
          value={String(cancelled)}
          helper="All time"
        />

        <StatCard label="Today" value={String(today)} helper="Booked today" />
      </div>

      <form
        method="GET"
        className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <div className="space-y-2">
          <label
            htmlFor="doctorId"
            className="block text-sm font-medium text-slate-900"
          >
            Doctor
          </label>

          <select
            key={doctorId ?? "all-doctors"}
            id="doctorId"
            name="doctorId"
            defaultValue={doctorId ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All doctors</option>

            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-slate-900"
          >
            Status
          </label>

          <select
            key={status ?? "all-statuses"}
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="booked">Booked</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button type="submit">Apply filters</Button>

          {(doctorId !== undefined || status !== undefined) && (
            <Button asChild href="/admin/appointments" variant="secondary">
              Reset
            </Button>
          )}
        </div>
      </form>

      <div className="mt-8">
        {filteredAppointments.length === 0 ? (
          <EmptyState
            title="No appointments found"
            description="No appointments match the selected filters."
            action={
              <Button asChild href="/admin/appointments" variant="secondary">
                Reset filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-700">
                    Patient
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700">
                    Doctor
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700">
                    Specialty
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700">
                    Date and time
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-700">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-900">
                      {appointment.patient.name}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {appointment.doctor.fullName}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {appointment.specialty.name}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatAppointmentTime(appointment.startsAt)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={
                          appointment.status === "booked"
                            ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                            : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                        }
                      >
                        {appointment.status === "booked"
                          ? "Booked"
                          : "Cancelled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
