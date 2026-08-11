import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function LoginPage() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Login"
        description="Log in to book appointments, review your visits, and manage the clinic if your account has admin access."
      >
        <Button asChild href="/register" variant="secondary">
          Create account
        </Button>
      </PageHeader>
      <AuthForm mode="login" />
    </>
  );
}
