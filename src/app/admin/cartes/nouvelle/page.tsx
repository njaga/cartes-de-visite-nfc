import { AdminCardForm } from "@/components/admin-card-form";
import { requireAdmin } from "@/lib/admin-auth";

export default async function NewCardPage() {
  await requireAdmin();

  return (
    <main className="admin-shell">
      <section className="admin-content admin-content-narrow">
        <div className="admin-page-heading">
          <div>
            <a className="admin-back" href="/admin">← Retour au tableau de bord</a>
            <span>Nouvelle carte</span>
            <h1>Ajouter un collaborateur</h1>
            <p>Le token NFC sera généré automatiquement et restera stable.</p>
          </div>
        </div>
        <AdminCardForm />
      </section>
    </main>
  );
}
