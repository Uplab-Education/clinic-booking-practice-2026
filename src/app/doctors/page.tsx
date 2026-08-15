import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  listActiveDoctors,
  listSpecialties,
} from "@/db/queries/doctors";
import { DoctorCard } from "@/components/doctors/DoctorCard";

type DoctorsPageProps = {
  searchParams: Promise<{
    specialty?: string;
  }>;
};

export default async function DoctorsPage({
  searchParams,
}: DoctorsPageProps) {
  const params = await searchParams;
  const specialtyValue = params.specialty;

  const parsedSpecialtyId = Number(specialtyValue);

  const specialtyId =
    Number.isInteger(parsedSpecialtyId) && parsedSpecialtyId > 0
      ? parsedSpecialtyId
      : undefined;

  const [doctors, specialties] = await Promise.all([
    listActiveDoctors(specialtyId),
    listSpecialties(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Doctors"
        title="Our doctors"
        description="Browse clinic doctors, filter by specialty, and open a profile to see available time slots."
      />

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">
            Filter by specialty
          </span>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/doctors"
              className={`rounded-md border px-3 py-2 text-sm font-medium ${
                specialtyId === undefined
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              All specialties
            </Link>

            {specialties.map((specialty) => (
              <Link
                key={specialty.id}
                href={`/doctors?specialty=${specialty.id}`}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  specialtyId === specialty.id
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {specialty.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {doctors.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No doctors found"
            description="No active doctors match the selected specialty."
            action={
              <Button asChild href="/doctors">
                Clear filter
              </Button>
            }
          />
        </div>
      ) : (
        <section className="mt-8">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
