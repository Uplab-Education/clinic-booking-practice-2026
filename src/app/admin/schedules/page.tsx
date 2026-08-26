import Link from "next/link";

import { requireAdmin } from "@/auth/guards";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listAllDoctors } from "@/db/queries/doctors";
import { getDoctorSchedule } from "@/db/queries/schedules";

const weekdays = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

type AdminSchedulesPageProps = {
  searchParams: Promise<{
    doctorId?: string;
  }>;
};

export default async function AdminSchedulesPage({
  searchParams,
}: AdminSchedulesPageProps) {
  await requireAdmin();

  const doctors = await listAllDoctors();
  const { doctorId: doctorIdParam } = await searchParams;

  const doctorId = Number(doctorIdParam);

  const selectedDoctor =
    Number.isInteger(doctorId) && doctorId > 0
      ? doctors.find((doctor) => doctor.id === doctorId)
      : undefined;

  const schedule = selectedDoctor
    ? await getDoctorSchedule(selectedDoctor.id)
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Schedules"
        description="Set each doctor's weekly working hours and appointment slot length."
      />

      {doctors.length === 0 ? (
        <EmptyState
          title="No doctors available"
          description="Add a doctor before configuring a weekly schedule."
        />
      ) : (
        <>
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-slate-900">
              Choose doctor
            </p>

            <div className="flex flex-wrap gap-2">
              {doctors.map((doctor) => (
                <Link
                  key={doctor.id}
                  href={`/admin/schedules?doctorId=${doctor.id}`}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    selectedDoctor?.id === doctor.id
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-900"
                  }`}
                >
                  {doctor.fullName}
                </Link>
              ))}
            </div>
          </div>

          {!selectedDoctor ? (
            <EmptyState
              title="Choose a doctor"
              description="Select a doctor to view their weekly schedule."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Start</th>
                    <th className="px-4 py-3">End</th>
                    <th className="px-4 py-3">Slot length</th>
                  </tr>
                </thead>

                <tbody>
                  {weekdays.map((day) => {
                    const entry = schedule.find(
                      (item) => item.weekday === day.value,
                    );

                    return (
                      <tr
                        key={day.value}
                        className="border-t border-slate-200"
                      >
                        <td className="px-4 py-3 font-medium">
                          {day.label}
                        </td>

                        {entry ? (
                          <>
                            <td className="px-4 py-3">
                              {entry.startTime.slice(0, 5)}
                            </td>
                            <td className="px-4 py-3">
                              {entry.endTime.slice(0, 5)}
                            </td>
                            <td className="px-4 py-3">
                              {entry.slotMinutes} min
                            </td>
                          </>
                        ) : (
                          <td
                            colSpan={3}
                            className="px-4 py-3 text-slate-500"
                          >
                            Day off
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}