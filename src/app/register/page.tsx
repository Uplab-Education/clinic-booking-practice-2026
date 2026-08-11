import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function RegisterPage() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Register"
        description="Create a patient account to book appointments with clinic doctors online."
      >
        <Button asChild href="/login" variant="secondary">
          Back to login
        </Button>
      </PageHeader>
      <AuthForm mode="register" />
    </>
  );
}
