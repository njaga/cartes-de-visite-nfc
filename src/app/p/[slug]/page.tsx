import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.58.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.58 1 1 0 0 1-.25 1z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2 8 6 8-6" />
    </svg>
  );
}

function WebIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <path d="M2 20c.5-4 2.5-6 6-6s5.5 2 6 6M17 8v6M14 11h6" />
    </svg>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = getProfileBySlug(slug);

  if (!profile) {
    return { title: "Profil introuvable" };
  }

  return {
    title: `${profile.firstName} ${profile.lastName}`,
    description: `${profile.jobTitle} — ${profile.subsidiary}`
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = getProfileBySlug(slug);

  if (!profile) notFound();

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`;

  return (
    <main className="profile-shell">
      <article className="profile-card">
        <header className="profile-hero">
          <div className="profile-brand">
            <span className="brand-mark brand-mark-small">V</span>
            <div>
              <strong>VIGILUS</strong>
              <small>{profile.subsidiary}</small>
            </div>
          </div>

          <div className="identity">
            <div className="avatar" aria-hidden="true">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photoUrl} alt="" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <span className="subsidiary-pill">{profile.subsidiary}</span>
            <h1>{fullName}</h1>
            <p className="job-title">{profile.jobTitle}</p>
          </div>
        </header>

        <section className="primary-actions" aria-label="Actions principales">
          {profile.mobile && (
            <a className="round-action" href={`tel:${profile.mobile.replace(/\s/g, "")}`}>
              <span className="round-icon"><PhoneIcon /></span>
              <span>Appeler</span>
            </a>
          )}

          <a className="round-action" href={`mailto:${profile.email}`}>
            <span className="round-icon"><MailIcon /></span>
            <span>E-mail</span>
          </a>

          <a className="round-action" href={profile.website} target="_blank" rel="noreferrer">
            <span className="round-icon"><WebIcon /></span>
            <span>Site web</span>
          </a>
        </section>

        <a className="save-contact" href={`/p/${profile.slug}/contact.vcf`}>
          <ContactIcon />
          <span>Ajouter aux contacts</span>
        </a>

        <section className="info-section">
          <h2>Coordonnées</h2>
          <div className="info-list">
            {profile.mobile && (
              <a href={`tel:${profile.mobile.replace(/\s/g, "")}`}>
                <span>Téléphone portable</span>
                <strong>{profile.mobile}</strong>
              </a>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>
                <span>Téléphone fixe</span>
                <strong>{profile.phone}</strong>
              </a>
            )}
            <a href={`mailto:${profile.email}`}>
              <span>E-mail</span>
              <strong>{profile.email}</strong>
            </a>
            <a href={profile.website} target="_blank" rel="noreferrer">
              <span>Site web</span>
              <strong>{profile.website.replace(/^https?:\/\//, "")}</strong>
            </a>
            <div>
              <span>Adresse</span>
              <strong>{profile.address}, {profile.city}, {profile.country}</strong>
            </div>
          </div>
        </section>

        {profile.presentation && (
          <section className="info-section">
            <h2>Présentation</h2>
            <p className="presentation">{profile.presentation}</p>
          </section>
        )}

        {!!profile.socialLinks?.length && (
          <section className="info-section">
            <h2>Réseaux sociaux</h2>
            <div className="social-list">
              {profile.socialLinks.map((link) => (
                <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>
                  <span>{link.label}</span>
                  <strong>Ouvrir ↗</strong>
                </a>
              ))}
            </div>
          </section>
        )}

        <footer className="profile-footer">
          <span className="footer-stripes" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <p>{profile.company}</p>
        </footer>
      </article>
    </main>
  );
}
