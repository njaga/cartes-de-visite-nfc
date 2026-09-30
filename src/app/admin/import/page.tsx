import { importCardsAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";

type ImportPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    skipped?: string;
    error?: string;
  }>;
};

export default async function ImportPage({ searchParams }: ImportPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const hasResult = params.created || params.updated || params.skipped;

  return (
    <main className="admin-shell">
      <section className="admin-content admin-content-narrow">
        <div className="admin-page-heading">
          <div>
            <a className="admin-back" href="/admin">← Retour au tableau de bord</a>
            <span>Import massif</span>
            <h1>Importer les collaborateurs</h1>
            <p>Ajoutez ou mettez à jour plusieurs cartes à partir d’un fichier Excel.</p>
          </div>
        </div>

        {params.error === "file" && (
          <p className="admin-alert">Sélectionnez un fichier Excel avant de lancer l’import.</p>
        )}
        {params.error === "format" && (
          <p className="admin-alert">Le fichier doit être au format .xlsx.</p>
        )}
        {hasResult && (
          <div className="import-result">
            <article><strong>{params.created ?? "0"}</strong><span>créées</span></article>
            <article><strong>{params.updated ?? "0"}</strong><span>mises à jour</span></article>
            <article><strong>{params.skipped ?? "0"}</strong><span>ignorées</span></article>
          </div>
        )}

        <section className="admin-form-section import-panel">
          <div className="admin-section-heading">
            <div>
              <span>Excel</span>
              <h2>Fichier collaborateurs</h2>
            </div>
            <a className="admin-secondary-button" href="/api/import-template">
              Télécharger le modèle
            </a>
          </div>

          <div className="import-guidance">
            <p>
              L’e-mail sert d’identifiant de rapprochement : s’il existe déjà, la fiche est mise à
              jour sans changer son token NFC.
            </p>
            <p>
              Les colonnes obligatoires sont <strong>Prénom</strong>, <strong>Nom</strong>,
              <strong> Poste</strong> et <strong>Email</strong>. Gardez les téléphones en format texte
              avec l’indicatif pays.
            </p>
          </div>

          <form className="import-form" action={importCardsAction}>
            <label className="file-drop">
              <span>Choisir le fichier .xlsx</span>
              <input type="file" name="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required />
            </label>
            <button type="submit">Importer les collaborateurs</button>
          </form>
        </section>
      </section>
    </main>
  );
}
