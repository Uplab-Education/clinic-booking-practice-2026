import Link from "next/link";
import type { DoctorWithSpecialty } from "@/db/queries/doctors";

type DoctorCardProps = {
  doctor: DoctorWithSpecialty;
};

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">
        {doctor.fullName}
      </h2>

      <p className="mt-1 text-sm font-medium text-slate-600">
        {doctor.specialty.name}
      </p>

      {doctor.room ? (
        <p className="mt-2 text-sm text-slate-500">
          Room: {doctor.room}
        </p>
      ) : null}

      {doctor.bio ? (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {doctor.bio}
        </p>
      ) : null}

      <div className="mt-4">
        <Link
          href={`/doctors/${doctor.id}`}
          className="inline-flex rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}
