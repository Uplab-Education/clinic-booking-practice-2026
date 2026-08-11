import { requireAdmin } from "@/auth/guards";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

const sections = [
  {
    href: "/admin/doctors",
    title: "Doctors",
    description: "Add new doctors, edit their details, and deactivate those who left.",
  },
  {
    href: "/admin/schedules",
    title: "Schedules",
    description: "Manage each doctor's weekly working hours and slot length.",
  },
  {
    href: "/admin/appointments",
    title: "Appointments",
    description: "See all booked and cancelled appointments across the clinic.",
  },
];

export default async function AdminPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Clinic administration"
        description="Manage doctors, their weekly schedules, and keep an eye on all appointments."
      />
      <section className="grid gap-4 lg:grid-cols-3">
        {sections.map((section) => (
          <article
            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={section.href}
          >
            <div className="flex-1">
              <h2 className="text-base font-semibold text-slate-950">{section.title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{section.description}</p>
            </div>
            <div>
              <Button asChild href={section.href} variant="secondary">
                Open
              </Button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
