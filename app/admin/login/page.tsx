import Link from "next/link";
import { redirect } from "next/navigation";
import { CredentialsLoginForm } from "@/components/credentials-login-form";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await requireAdmin();

  if (admin.ok) {
    redirect("/admin");
  }

  return (
    <main className="account-page" id="main-content">
      <section className="account-shell">
        <Link className="account-back" href="/">
          Terug naar agenda
        </Link>
        <p className="account-kicker">Platform admin</p>
        <h1>Admin login</h1>
        <div className="account-card">
          <CredentialsLoginForm callbackUrl="/admin" submitLabel="Inloggen als admin" />
        </div>
      </section>
    </main>
  );
}
