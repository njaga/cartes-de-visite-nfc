import { notFound } from "next/navigation";
import { AdminCardForm } from "@/components/admin-card-form";
import { requireAdmin } from "@/lib/admin-auth";
import { getCardById } from "@/lib/db";
import { getPublicSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type EditCardPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

function statusLabel(status: string | undefined) {
  if (status === "tested") return "Programmée et testée";
  if (status === "programmed") return "Programmée, à tester";
  return "À programmer";
}

export default async function EditCardPage({ params, searchParams }: EditCardPageProps) {
  await requireAdmin();

  const { id } = await params;
  const { saved } = await searchParams;
  const card = getCardById(Number(id));

  if (!card) notFound();

  const baseUrl = getPublicSiteUrl();
  const nfcUrl = baseUrl + "/n/" + card.nfcToken;

  return (
    <main className="admin-shell">
      <section className="admin-content">
        <div className="admin-page-heading">
          <div>
            <a className="admin-back" href="/admin">← Retour au tableau de bord</a>
            <span>Carte #{card.id}</span>
            <h1>{card.firstName} {card.lastName}</h1>
            <p>{card.jobTitle} — {card.subsidiary}</p>
          </div>
          <div className="admin-heading-actions">
            <a className="admin-secondary-button" href={"/p/" + card.slug} target="_blank">
              Voir le profil ↗
            </a>
            <a className="admin-secondary-button" href={"/admin/cartes/" + card.id + "/impression"}>
              Carte à imprimer
            </a>
            <a className="admin-primary-button" href={"/admin/cartes/" + card.id + "/programmer"}>
              Programmer le NFC
            </a>
          </div>
        </div>

        {saved === "1" && <p className="admin-success">Modifications enregistrées.</p>}

        <div className="admin-edit-grid">
          <AdminCardForm card={card} />

          <aside className="admin-qr-panel">
            <span>NFC + QR</span>
            <h2>{statusLabel(card.nfcStatus)}</h2>
            <div className={"nfc-big-status nfc-status-" + (card.nfcStatus ?? "new")}>
              {card.nfcStatus === "tested" ? "✓" : card.nfcStatus === "programmed" ? "…" : "NFC"}
            </div>
            <code>{nfcUrl}</code>
            <p>
              L’URL reste identique même si les coordonnées du collaborateur sont modifiées.
            </p>
            <a className="admin-program-link" href={"/admin/cartes/" + card.id + "/programmer"}>
              Ouvrir le guide de programmation
            </a>
            <img
              src={"/api/qr/" + card.nfcToken}
              alt={"QR code de " + card.firstName + " " + card.lastName}
              width="280"
              height="280"
            />
            <a href={"/api/qr/" + card.nfcToken + "?download=1"}>
              Télécharger le QR code SVG
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}
