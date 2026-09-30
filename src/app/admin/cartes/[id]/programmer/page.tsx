import { notFound } from "next/navigation";
import { updateProvisioningAction } from "@/app/admin/actions";
import { CopyShareField } from "@/components/copy-share-field";
import { requireAdmin } from "@/lib/admin-auth";
import { getBrandConfig, getCardById } from "@/lib/db";

export const dynamic = "force-dynamic";

type ProvisionPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string }>;
};

function statusLabel(status: string | undefined) {
  if (status === "tested") return "Programmée et testée";
  if (status === "programmed") return "Programmée, à tester";
  return "À programmer";
}

export default async function ProvisionCardPage({ params, searchParams }: ProvisionPageProps) {
  await requireAdmin();

  const { id } = await params;
  const { updated } = await searchParams;
  const card = getCardById(Number(id));

  if (!card) notFound();

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const nfcUrl = baseUrl + "/n/" + card.nfcToken;
  const fullName = card.firstName + " " + card.lastName;
  const brand = getBrandConfig(card.subsidiary);

  return (
    <main className="provision-shell">
      <header className="provision-header">
        <a href={"/admin/cartes/" + card.id}>← Retour à la fiche</a>
        <span className={"provision-status provision-" + (card.nfcStatus ?? "new")}>
          {statusLabel(card.nfcStatus)}
        </span>
      </header>

      <section className="provision-card">
        <div className="provision-person">
          <span className="provision-brand-logo">
            <img src={brand.logoUrl || "/branding/vigilus-groupe-sa.png"} alt={card.subsidiary} />
          </span>
          <div>
            <strong>{fullName}</strong>
            <small>{card.jobTitle} · {card.subsidiary}</small>
          </div>
        </div>

        <div className="provision-intro">
          <span>Programmation mobile</span>
          <h1>Préparer la carte NFC</h1>
          <p>
            Cette URL est la seule donnée à écrire dans la puce. Ne mettez ni le numéro de
            téléphone ni la vCard directement dans NFC Tools.
          </p>
        </div>

        {updated === "1" && <p className="admin-success">Statut de la carte mis à jour.</p>}

        <section className="provision-step">
          <div className="provision-step-number">1</div>
          <div className="provision-step-content">
            <h2>Écrire l’URL avec NFC Tools</h2>
            <ol>
              <li>Sur le téléphone, ouvrez <strong>NFC Tools</strong>.</li>
              <li>Choisissez <strong>Écrire → Ajouter un enregistrement → URL / URI</strong>.</li>
              <li>Copiez l’URL ci-dessous et collez-la dans NFC Tools.</li>
              <li>Appuyez sur <strong>Écrire</strong>, puis approchez la carte NFC du téléphone.</li>
            </ol>

            <CopyShareField value={nfcUrl} shareTitle={"Carte NFC — " + fullName} />

            <form action={updateProvisioningAction} className="provision-action-form">
              <input type="hidden" name="id" value={card.id} />
              <input type="hidden" name="status" value="programmed" />
              <button type="submit">J’ai programmé la carte</button>
            </form>
          </div>
        </section>

        <section className={"provision-step " + (card.nfcStatus === "new" ? "is-muted" : "")}>
          <div className="provision-step-number">2</div>
          <div className="provision-step-content">
            <h2>Tester la carte physique</h2>
            <p>
              Fermez NFC Tools, verrouillez l’écran si nécessaire, puis approchez le téléphone
              de la carte. La notification doit ouvrir le profil de {card.firstName}.
            </p>
            <div className="provision-test-links">
              <a href={nfcUrl} target="_blank">Tester l’URL dans le navigateur ↗</a>
              <a href={"/p/" + card.slug} target="_blank">Voir le profil public ↗</a>
            </div>

            <form action={updateProvisioningAction} className="provision-action-form">
              <input type="hidden" name="id" value={card.id} />
              <input type="hidden" name="status" value="tested" />
              <button type="submit" disabled={card.nfcStatus === "new"}>
                La carte physique fonctionne
              </button>
            </form>
          </div>
        </section>

        <section className="provision-step provision-qr-step">
          <div className="provision-step-number">QR</div>
          <div className="provision-step-content">
            <h2>Alternative QR code</h2>
            <p>Le QR code renvoie vers le même profil et reste disponible si le NFC du téléphone est désactivé.</p>
            <img src={"/api/qr/" + card.nfcToken} alt={"QR code de " + fullName} width="240" height="240" />
            <a className="provision-download" href={"/api/qr/" + card.nfcToken + "?download=1"}>
              Télécharger le QR code SVG
            </a>
          </div>
        </section>

        {card.nfcStatus !== "new" && (
          <form action={updateProvisioningAction} className="provision-reset">
            <input type="hidden" name="id" value={card.id} />
            <input type="hidden" name="status" value="new" />
            <button type="submit">Réinitialiser le statut de programmation</button>
          </form>
        )}
      </section>
    </main>
  );
}
