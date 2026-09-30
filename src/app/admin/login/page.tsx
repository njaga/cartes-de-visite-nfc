import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { loginAdmin } from "@/app/admin/actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const user = await getAdminUser();
  if (user) redirect("/admin");

  const { error } = await searchParams;

  return (
    <main className="admin-login-shell">
      <section className="admin-login-card">
        <div className="profile-brand">
          <span className="brand-mark brand-mark-small">V</span>
          <div><strong>VIGILUS</strong><small>Digital Cards</small></div>
        </div>

        <div className="admin-login-copy">
          <span>Administration</span>
          <h1>Gestion des cartes NFC</h1>
          <p>Connectez-vous pour gérer les collaborateurs, les QR codes et les scans.</p>
        </div>

        {error === "credentials" && <p className="admin-alert">E-mail ou mot de passe incorrect.</p>}
        {error === "setup" && <p className="admin-alert">L’administration n’est pas encore configurée dans les variables d’environnement.</p>}

        <form className="admin-login-form" action={loginAdmin}>
          <label><span>E-mail</span><input name="email" type="email" autoComplete="username" required /></label>
          <label><span>Mot de passe</span><input name="password" type="password" autoComplete="current-password" required /></label>
          <button type="submit">Se connecter</button>
        </form>
      </section>
    </main>
  );
}
