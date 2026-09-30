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
            <span>BAT & impression</span>
            <h1>Carte physique NFC</h1>
            <p>Format fini 85,6 × 54 mm. Export PDF avec 3 mm de fond perdu et repères de coupe.</p>
          </div>
          <div className="admin-heading-actions">
            <a className="admin-secondary-button" href="/admin/filiales">Identité de la filiale</a>
            <a className="admin-primary-button" href={"/api/card-print/" + card.id}>
              Télécharger le PDF imprimeur
            </a>
          </div>
        </div>

        <div className="print-brand-summary">
          <span style={{ background: brand.primaryColor }} />
          <span style={{ background: brand.accentColor }} />
          {brand.logoUrl && <img src={brand.logoUrl} alt="" />}
          <strong>{card.firstName} {card.lastName}</strong>
          <small>{card.jobTitle}</small>
        </div>

        <section className="card-mockup-stage" aria-label="Aperçu réaliste de la carte">
          <div className="card-mockup card-mockup-front">
            <img src={"/api/card-artwork/" + card.id + "?side=front"} alt="Aperçu recto" />
          </div>
          <div className="card-mockup card-mockup-back">
            <img src={"/api/card-artwork/" + card.id + "?side=back"} alt="Aperçu verso" />
          </div>
          <div className="mockup-caption">
            <span>Aperçu</span>
            <strong>PVC · format carte bancaire · recto/verso</strong>
          </div>
        </section>

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

        <section className="print-specs">
          <article>
            <span>Format fini</span>
            <strong>85,6 × 54 mm</strong>
          </article>
          <article>
            <span>Fond perdu PDF</span>
            <strong>3 mm</strong>
          </article>
          <article>
            <span>Pages</span>
            <strong>2 · recto/verso</strong>
          </article>
          <article>
            <span>QR code</span>
            <strong>Vectoriel</strong>
          </article>
        </section>

        <section className="print-note">
          <strong>BAT imprimeur</strong>
          <p>
            Le PDF contient deux pages au format 91,6 × 60 mm, soit le format fini avec 3 mm de
            fond perdu sur chaque côté. Les repères de coupe indiquent le format final 85,6 × 54 mm.
            Faites valider un BAT physique avant une impression en série.
          </p>
        </section>
      </section>
    </main>
  );
}
