import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

export default function Home() {
  const highlights = [
    { label: "Therapy", value: "2 doctors", status: "Open today" },
    { label: "Cardiology", value: "1 doctor", status: "Open today" },
    { label: "Dermatology", value: "1 doctor", status: "Mon / Wed / Fri" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Book a clinic visit in a couple of clicks"
        description="Browse doctors, pick a free time slot, and manage your appointments online - no phone calls needed."
      >
        <Button asChild href="/doctors">
          Browse doctors
        </Button>
        <Button asChild href="/appointments" variant="secondary">
          My appointments
        </Button>
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Doctors" value="5" helper="accepting patients" />
        <StatCard label="Specialties" value="4" helper="from therapy to pediatrics" />
        <StatCard label="Visit length" value="30 min" helper="standard appointment" />
        <StatCard label="Booking horizon" value="14 days" helper="see slots two weeks ahead" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold">Departments</h2>
            <p className="mt-1 text-sm text-slate-500">
              Doctors and their availability at a glance.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {highlights.map((item) => (
              <div className="flex items-center justify-between gap-4 px-5 py-4" key={item.label}>
                <div>
                  <p className="font-medium text-slate-950">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.value}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">How it works</h2>
          <div className="mt-4 space-y-3">
            {[
              "Pick a doctor and a free time slot",
              "Confirm the appointment in one click",
              "Review or cancel your visits anytime",
            ].map((step) => (
              <div className="rounded-md border border-slate-200 p-3" key={step}>
                <p className="text-sm font-medium text-slate-950">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}
