import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function DoctorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Doctors"
        title="Our doctors"
        description="Browse clinic doctors, filter by specialty, and open a profile to see available time slots."
      />
      <EmptyState
        title="Doctors catalog is coming soon"
        description="This page will list active doctors with their specialty, room, and a short bio."
      />
    </>
  );
}
