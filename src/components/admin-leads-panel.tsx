import { updateLeadStatusAction } from "@/app/admin/actions";
import type { CardLead } from "@/lib/landing";

function sourceLabel(source: CardLead["source"]) {
  if (source === "nfc") return "NFC";
  if (source === "qr") return "QR";
  return "Web";
}

function dateLabel(value: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function AdminLeadsPanel({
  cardId,
  leads
}: {
  cardId: number;
  leads: CardLead[];
}) {
  return (
    <section className="admin-leads-section" id="leads">
      <div className="admin-section-heading">
        <div>
          <span>Prospection</span>
          <h2>Leads reçus</h2>
        </div>
        <strong className="admin-lead-count">{leads.length}</strong>
      </div>

      {!leads.length ? (
        <div className="admin-empty-state">
          <strong>Aucun lead pour le moment.</strong>
          <p>Les demandes envoyées depuis la landing page apparaîtront ici.</p>
        </div>
      ) : (
        <div className="admin-leads-list">
          {leads.map((lead) => (
            <article className="admin-lead-card" key={lead.id}>
              <div className="admin-lead-main">
                <div className="admin-lead-title">
                  <strong>{lead.name}</strong>
                  <span>{sourceLabel(lead.source)}</span>
                </div>

                {lead.company && <p className="admin-lead-company">{lead.company}</p>}

                <div className="admin-lead-contacts">
                  {lead.phone && <a href={"tel:" + lead.phone}>{lead.phone}</a>}
                  {lead.email && <a href={"mailto:" + lead.email}>{lead.email}</a>}
                </div>

                {lead.message && <p className="admin-lead-message">{lead.message}</p>}

                <small>{dateLabel(lead.createdAt)}</small>
              </div>

              <form action={updateLeadStatusAction} className="admin-lead-status">
                <input type="hidden" name="leadId" value={lead.id} />
                <input type="hidden" name="cardId" value={cardId} />
                <select name="status" defaultValue={lead.status}>
                  <option value="new">Nouveau</option>
                  <option value="contacted">Contacté</option>
                  <option value="qualified">Qualifié</option>
                  <option value="converted">Converti</option>
                </select>
                <button type="submit">Mettre à jour</button>
              </form>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
