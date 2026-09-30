import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getBrandConfig, getCardById } from "@/lib/db";

export const dynamic = "force-dynamic";

type PrintPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PrintCardPage({ params }: PrintPageProps) {
  await requireAdmin();
  const { id } = await params;
  const card = getCardById(Number(id));
  if (!card) notFound();

  const brand = getBrandConfig(card.subsidiary);

  return (
    <main className="admin-shell">
      <section className="admin-content">
        <div className="admin-page-heading">
          <div>
            <a className="admin-back" href={"/admin/cartes/" + card.id}>← Retour à la fiche</a>
            <span>Impression</span>
            <h1>Carte physique</h1>
            <p>Format ISO ID-1 : 85,6 × 54 mm. Recto et verso utilisent l’identité de {card.subsidiary}.</p>
          </div>
          <a className="admin-secondary-button" href="/admin/filiales">Modifier l’identité de la filiale</a>
        </div>

        <div className="print-brand-summary">
          <span style={{ background: brand.primaryColor }} />
          <span style={{ background: brand.accentColor }} />
          <strong>{card.firstName} {card.lastName}</strong>
          <small>{card.jobTitle}</small>
        </div>

        <div className="artwork-grid">
          <article className="artwork-panel">
            <div className="artwork-panel-head">
              <div><span>Recto</span><h2>Identité du collaborateur</h2></div>
              <a href={"/api/card-artwork/" + card.id + "?side=front&download=1"}>Télécharger SVG</a>
            </div>
            <div className="artwork-preview">
              <img src={"/api/card-artwork/" + card.id + "?side=front"} alt="Recto de la carte" />
            </div>
          </article>

          <article className="artwork-panel">
            <div className="artwork-panel-head">
              <div><span>Verso</span><h2>NFC + QR code</h2></div>
              <a href={"/api/card-artwork/" + card.id + "?side=back&download=1"}>Télécharger SVG</a>
            </div>
            <div className="artwork-preview">
              <img src={"/api/card-artwork/" + card.id + "?side=back"} alt="Verso de la carte" />
            </div>
          </article>
        </div>

        <section className="print-note">
          <strong>Pour l’imprimeur</strong>
          <p>
            Les fichiers SVG sont vectoriels au format fini 85,6 × 54 mm. L’imprimeur peut ajouter
            son fond perdu selon son procédé. Faites toujours un BAT avant impression en série.
          </p>
        </section>
      </section>
    </main>
  );
}
