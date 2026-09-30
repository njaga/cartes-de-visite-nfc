import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileShareButton } from "@/components/profile-share-button";
import { getBrandConfig, getProfileBySlug } from "@/lib/db";

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

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11.6a8 8 0 0 1-11.8 7l-4.2 1.1 1.1-4.1A8 8 0 1 1 20 11.6Z" />
      <path d="M8.5 8.3c.2-.4.4-.4.7-.4h.4c.2 0 .3.1.4.4l.8 1.8c.1.3 0 .5-.2.7l-.6.7c.8 1.5 1.8 2.5 3.3 3.2l.6-.8c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.5 0 .8-.5 1.5-1.2 1.8-.6.3-1.5.4-2.8-.1-1.7-.6-3.1-1.7-4.3-3.2-1.1-1.4-1.7-2.9-1.7-4 0-.6.2-1 .4-1.3Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 5h5v5M19 5l-9 9" />
      <path d="M19 13v6H5V5h6" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

function whatsAppHref(number: string, message?: string) {
  const base = "https://wa.me/" + number.replace(/\D/g, "");
  return message ? base + "?text=" + encodeURIComponent(message) : base;
}

function mapsHref(address: string, city: string, country: string) {
  const query = [address, city, country].filter(Boolean).join(", ");
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
}

function offerIsActive(startDate?: string, endDate?: string) {
  const today = new Date().toISOString().slice(0, 10);
  if (startDate && startDate > today) return false;
  if (endDate && endDate < today) return false;
  return true;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);

  if (!profile) return { title: "Profil introuvable" };

  return {
    title: profile.firstName + " " + profile.lastName,
    description: profile.jobTitle + " — " + profile.subsidiary,
    robots: {
      index: false,
      follow: false
    }
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);
  if (!profile) notFound();

  const brand = await getBrandConfig(profile.subsidiary);
  const fullName = profile.firstName + " " + profile.lastName;
  const initials = (profile.firstName[0] ?? "") + (profile.lastName[0] ?? "");
  const whatsapp = profile.whatsapp || profile.mobile;
  const whatsappHref = whatsapp
    ? whatsAppHref(whatsapp, profile.whatsappMessage)
    : undefined;
  const location = [profile.city, profile.country].filter(Boolean).join(" · ");
  const showOffer =
    Boolean(profile.offerTitle || profile.offerText) &&
    offerIsActive(profile.offerStartDate, profile.offerEndDate);
  const hasCommercial =
    Boolean(profile.services?.length) ||
    Boolean(profile.commercialCtaLabel && profile.commercialCtaUrl) ||
    Boolean(profile.brochureUrl) ||
    showOffer;

  const themeStyle = {
    "--profile-primary": brand.primaryColor,
    "--profile-accent": brand.accentColor
  } as CSSProperties;

  const secondaryMobileHref = whatsappHref
    ? whatsappHref
    : profile.mobile
      ? "tel:" + profile.mobile.replace(/\s/g, "")
      : "mailto:" + profile.email;

  const secondaryMobileLabel = whatsappHref ? "WhatsApp" : profile.mobile ? "Appeler" : "E-mail";

  return (
    <main className="public-profile-shell" style={themeStyle}>
      <div className="public-profile-frame">
        <header className="public-profile-topbar">
          <div className="public-profile-brand">
            <img
              src={brand.logoUrl || "/branding/vigilus-groupe-sa.png"}
              alt={profile.subsidiary}
            />
          </div>
          <div className="public-profile-topmeta">
            <span>Carte professionnelle</span>
            <i aria-hidden="true" />
            <strong>{profile.subsidiary}</strong>
          </div>
        </header>

        <div className="public-profile-layout">
          <aside className="public-profile-identity">
            <div className="public-profile-photo">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={"Portrait de " + fullName} />
              ) : (
                <div className="public-profile-monogram" aria-label={fullName}>
                  <span>{initials}</span>
                </div>
              )}
              <span className="public-profile-photo-accent" aria-hidden="true" />
            </div>

            <div className="public-profile-nameblock">
              <span>{profile.subsidiary}</span>
              <h1>{fullName}</h1>
              <p>{profile.jobTitle}</p>
              <small>{profile.company}</small>
            </div>

            {location && (
              <div className="public-profile-location">
                <PinIcon />
                <span>{location}</span>
              </div>
            )}

            <div className="public-profile-main-actions">
              <a className="public-save-contact" href={"/p/" + profile.slug + "/contact.vcf"}>
                <ContactIcon />
                <span>Enregistrer le contact</span>
                <ArrowIcon />
              </a>
              <ProfileShareButton name={fullName} />
            </div>

            <div className="public-profile-quick-actions" aria-label="Actions de contact">
              {profile.mobile && (
                <a href={"tel:" + profile.mobile.replace(/\s/g, "")}>
                  <span><PhoneIcon /></span>
                  <small>Appeler</small>
                </a>
              )}
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  <span><WhatsAppIcon /></span>
                  <small>WhatsApp</small>
                </a>
              )}
              <a href={"mailto:" + profile.email}>
                <span><MailIcon /></span>
                <small>E-mail</small>
              </a>
            </div>
          </aside>

          <section className="public-profile-content">
            {profile.presentation && (
              <section className="public-profile-section public-profile-about">
                <span className="public-profile-section-label">À propos</span>
                <p>{profile.presentation}</p>
              </section>
            )}

            {hasCommercial && (
              <section className="public-profile-section public-profile-commercial">
                <div className="public-profile-section-heading">
                  <div>
                    <span className="public-profile-section-label">Solutions</span>
                    <h2>Comment pouvons-nous vous accompagner ?</h2>
                  </div>
                </div>

                {!!profile.services?.length && (
                  <div className="public-services-grid">
                    {profile.services.slice(0, 8).map((service, index) => (
                      <div className="public-service-item" key={service + index}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{service}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {(profile.commercialCtaLabel && profile.commercialCtaUrl) || profile.brochureUrl ? (
                  <div className="public-commercial-actions">
                    {profile.commercialCtaLabel && profile.commercialCtaUrl && (
                      <a
                        className="public-commercial-primary"
                        href={profile.commercialCtaUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>{profile.commercialCtaLabel}</span>
                        <ArrowIcon />
                      </a>
                    )}

                    {profile.brochureUrl && (
                      <a
                        className="public-commercial-resource"
                        href={profile.brochureUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <DocumentIcon />
                        <span>{profile.brochureLabel || "Voir notre brochure"}</span>
                      </a>
                    )}
                  </div>
                ) : null}
              </section>
            )}

            {showOffer && (
              <section className="public-profile-section public-offer-section">
                <div className="public-offer-card">
                  <div className="public-offer-copy">
                    <span>À découvrir</span>
                    {profile.offerTitle && <h2>{profile.offerTitle}</h2>}
                    {profile.offerText && <p>{profile.offerText}</p>}
                  </div>
                  {profile.offerUrl && (
                    <a href={profile.offerUrl} target="_blank" rel="noreferrer">
                      <span>En savoir plus</span>
                      <ArrowIcon />
                    </a>
                  )}
                </div>
              </section>
            )}

            <section className="public-profile-section">
              <div className="public-profile-section-heading">
                <div>
                  <span className="public-profile-section-label">Coordonnées</span>
                  <h2>Restons en contact</h2>
                </div>
              </div>

              <div className="public-profile-contact-list">
                {profile.mobile && (
                  <a href={"tel:" + profile.mobile.replace(/\s/g, "")}>
                    <span className="public-contact-icon"><PhoneIcon /></span>
                    <span className="public-contact-copy">
                      <small>Téléphone mobile</small>
                      <strong>{profile.mobile}</strong>
                    </span>
                    <span className="public-contact-arrow"><ArrowIcon /></span>
                  </a>
                )}

                {profile.phone && (
                  <a href={"tel:" + profile.phone.replace(/\s/g, "")}>
                    <span className="public-contact-icon"><PhoneIcon /></span>
                    <span className="public-contact-copy">
                      <small>Téléphone fixe</small>
                      <strong>{profile.phone}</strong>
                    </span>
                    <span className="public-contact-arrow"><ArrowIcon /></span>
                  </a>
                )}

                <a href={"mailto:" + profile.email}>
                  <span className="public-contact-icon"><MailIcon /></span>
                  <span className="public-contact-copy">
                    <small>E-mail professionnel</small>
                    <strong>{profile.email}</strong>
                  </span>
                  <span className="public-contact-arrow"><ArrowIcon /></span>
                </a>

                <a href={profile.website} target="_blank" rel="noreferrer">
                  <span className="public-contact-icon"><WebIcon /></span>
                  <span className="public-contact-copy">
                    <small>Site web</small>
                    <strong>{profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</strong>
                  </span>
                  <span className="public-contact-arrow"><ExternalIcon /></span>
                </a>

                <a
                  href={mapsHref(profile.address, profile.city, profile.country)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="public-contact-icon"><PinIcon /></span>
                  <span className="public-contact-copy">
                    <small>Adresse professionnelle</small>
                    <strong>{profile.address}, {profile.city}</strong>
                  </span>
                  <span className="public-contact-arrow"><ExternalIcon /></span>
                </a>
              </div>
            </section>

            {!!profile.socialLinks?.length && (
              <section className="public-profile-section">
                <span className="public-profile-section-label">Réseaux professionnels</span>
                <div className="public-profile-socials">
                  {profile.socialLinks.map((link) => (
                    <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>
                      <span>{link.label}</span>
                      <ExternalIcon />
                    </a>
                  ))}
                </div>
              </section>
            )}

            <footer className="public-profile-footer">
              <div>
                <img
                  src={brand.logoUrl || "/branding/vigilus-groupe-sa.png"}
                  alt=""
                  aria-hidden="true"
                />
                <span>
                  <strong>{profile.company}</strong>
                  <small>Carte de visite digitale</small>
                </span>
              </div>
              <p>NFC · QR · vCard</p>
            </footer>
          </section>
        </div>
      </div>

      <nav className="public-profile-mobile-dock" aria-label="Actions rapides">
        <a className="public-mobile-save" href={"/p/" + profile.slug + "/contact.vcf"}>
          <ContactIcon />
          <span>Enregistrer</span>
        </a>
        <a
          className="public-mobile-reach"
          href={secondaryMobileHref}
          target={whatsappHref ? "_blank" : undefined}
          rel={whatsappHref ? "noreferrer" : undefined}
        >
          {whatsappHref ? <WhatsAppIcon /> : profile.mobile ? <PhoneIcon /> : <MailIcon />}
          <span>{secondaryMobileLabel}</span>
        </a>
      </nav>
    </main>
  );
}
