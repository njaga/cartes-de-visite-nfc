import { notFound } from "next/navigation";
import { AdminCardForm } from "@/components/admin-card-form";
import { requireAdmin } from "@/lib/admin-auth";
import { getCardById } from "@/lib/db";

export const dynamic = "force-dynamic";

type EditCardPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function EditCardPage({ params, searchParams }: EditCardPageProps) {
  await requireAdmin();

  const { id } = await params;
  const { saved } = await searchParams;
  const card = getCardById(Number(id));

  if (!card) notFound();

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
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
          <a className="admin-secondary-button" href={"/p/" + card.slug} target="_blank">
            Voir la carte digitale ↗
          </a>
        </div>

        {saved === "1" && <p className="admin-success">Modifications enregistrées.</p>}

        <div className="admin-edit-grid">
          <AdminCardForm card={card} />

          <aside className="admin-qr-panel">
            <span>NFC + QR</span>
            <h2>Lien de la carte physique</h2>
            <img
              src={"/api/qr/" + card.nfcToken}
              alt={"QR code de " + card.firstName + " " + card.lastName}
              width="280"
              height="280"
            />
            <code>{nfcUrl}</code>
            <p>
              Programmez cette URL dans la puce NFC. Le QR code utilise la même carte et permet
              de distinguer les scans QR des scans NFC.
            </p>
            <a href={"/api/qr/" + card.nfcToken + "?download=1"}>
              Télécharger le QR code SVG
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}
