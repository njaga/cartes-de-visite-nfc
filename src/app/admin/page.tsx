import Link from "next/link";
import { logoutAdmin, toggleCardAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllProfiles, getDashboardStats, getRecentScans, getTopCards } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatScanDate(value: string) {
  return new Intl.DateTimeFormat("fr-SN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Africa/Dakar"
  }).format(new Date(value.replace(" ", "T") + "Z"));
}

function nfcStatusLabel(status: string | undefined) {
  if (status === "tested") return "Testée";
  if (status === "programmed") return "À tester";
  return "À programmer";
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const cards = getAllProfiles({ includeInactive: true });
  const stats = getDashboardStats();
  const recentScans = getRecentScans(10);
  const topCards = getTopCards(5);

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <span className="brand-mark brand-mark-small">V</span>
          <div><strong>VIGILUS</strong><small>Digital Cards</small></div>
        </div>
        <div className="admin-user">
          <span>{admin.email}</span>
          <form action={logoutAdmin}><button type="submit">Déconnexion</button></form>
        </div>
      </header>

      <section className="admin-content">
        <div className="admin-page-heading">
          <div>
            <span>Vue d’ensemble</span>
            <h1>Cartes de visite digitales</h1>
            <p>Gérez les cartes, leur programmation NFC et les scans depuis un seul espace.</p>
          </div>
          <Link className="admin-primary-button" href="/admin/cartes/nouvelle">+ Nouvelle carte</Link>
        </div>

        <div className="admin-stats">
          <article><span>Cartes</span><strong>{stats.totalCards}</strong><small>{stats.activeCards} actives</small></article>
          <article><span>Cartes validées</span><strong>{stats.readyCards}</strong><small>NFC programmé et testé</small></article>
          <article><span>Scans aujourd’hui</span><strong>{stats.scansToday}</strong><small>NFC + QR</small></article>
          <article><span>Scans sur 7 jours</span><strong>{stats.scans7Days}</strong><small>activité récente</small></article>
        </div>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><span>Parc NFC</span><h2>Collaborateurs</h2></div></div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Collaborateur</th>
                  <th>Filiale</th>
                  <th>NFC</th>
                  <th>État</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id}>
                    <td>
                      <strong>{card.firstName} {card.lastName}</strong>
                      <small>{card.jobTitle}</small>
                    </td>
                    <td>{card.subsidiary}</td>
                    <td>
                      <span className={"nfc-status-badge nfc-status-" + (card.nfcStatus ?? "new")}>
                        {nfcStatusLabel(card.nfcStatus)}
                      </span>
                    </td>
                    <td>
                      <span className={card.active ? "status-active" : "status-inactive"}>
                        {card.active ? "Active" : "Désactivée"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <Link href={"/admin/cartes/" + card.id + "/programmer"}>Programmer</Link>
                        <Link href={"/admin/cartes/" + card.id}>Modifier</Link>
                        <form action={toggleCardAction}>
                          <input type="hidden" name="id" value={card.id} />
                          <input type="hidden" name="active" value={card.active ? "0" : "1"} />
                          <button type="submit">{card.active ? "Désactiver" : "Activer"}</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-panel-heading"><div><span>Activité</span><h2>Derniers scans</h2></div></div>
            <div className="scan-list">
              {recentScans.length ? recentScans.map((scan) => (
                <div className="scan-row" key={scan.id}>
                  <div><strong>{scan.firstName} {scan.lastName}</strong><small>{scan.subsidiary}</small></div>
                  <div><span className="scan-source">{scan.source.toUpperCase()}</span><small>{formatScanDate(scan.scannedAt)}</small></div>
                </div>
              )) : <p className="admin-empty">Aucun scan enregistré pour le moment.</p>}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading"><div><span>Classement</span><h2>Cartes les plus scannées</h2></div></div>
            <div className="scan-list">
              {topCards.map((card, index) => (
                <div className="scan-row" key={card.id}>
                  <div><strong>{index + 1}. {card.firstName} {card.lastName}</strong><small>{card.subsidiary}</small></div>
                  <strong>{card.scans} scans</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
