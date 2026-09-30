import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { submitLeadAction } from "@/app/admin/actions";
import { ProfileShareButton } from "@/components/profile-share-button";
import { getBrandConfig, getCardLandingData, getProfileBySlug } from "@/lib/db";
import type { CardCampaign, CardResource, CardService } from "@/lib/landing";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    lead?: string;
    leadError?: string;
    src?: string;
  }>;
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

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

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11.6a8 8 0 0 1-11.8 7l-4.2 1.1 1.1-4.1A8 8 0 1 1 20 11.6Z" />
      <path d="M8.5 8.3c.2-.4.4-.4.7-.4h.4c.2 0 .3.1.4.4l.8 1.8c.1.3 0 .5-.2.7l-.6.7c.8 1.5 1.8 2.5 3.3 3.2l.6-.8c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.5 0 .8-.5 1.5-1.2 1.8-.6.3-1.5.4-2.8-.1-1.7-.6-3.1-1.7-4.3-3.2-1.1-1.4-1.7-2.9-1.7-4 0-.6.2-1 .4-1.3Z" />
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

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
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

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 5h5v5M19 5l-9 9" />
      <path d="M19 13v6H5V5h6" />
    </svg>
  );
}

function ResourceIcon({ type }: { type: CardResource["resourceType"] }) {
  if (type === "video") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m10 9 5 3-5 3z" />
      </svg>
    );
  }

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
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent([address, city, country].filter(Boolean).join(", "))
  );
}

function campaignIsActive(campaign?: CardCampaign) {
  if (!campaign?.active) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (campaign.startsAt && campaign.startsAt > today) return false;
  if (campaign.endsAt && campaign.endsAt < today) return false;
  return true;
}

function legacyCampaign(profile: Awaited<ReturnType<typeof getProfileBySlug>>): CardCampaign | undefined {
  if (!profile || (!profile.offerTitle && !profile.offerText)) return undefined;
  return {
    title: profile.offerTitle || "À découvrir",
    description: profile.offerText,
    ctaLabel: profile.offerUrl ? "En savoir plus" : undefined,
    ctaUrl: profile.offerUrl,
    startsAt: profile.offerStartDate,
    endsAt: profile.offerEndDate,
    active: true
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);

  if (!profile) return { title: "Profil introuvable" };

  return {
    title: profile.firstName + " " + profile.lastName + " — " + profile.subsidiary,
    description: profile.presentation || profile.jobTitle + " — " + profile.subsidiary,
    robots: { index: false, follow: false }
  };
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const profile = await getProfileBySlug(slug);
  if (!profile?.id) notFound();

  const [brand, landing] = await Promise.all([
    getBrandConfig(profile.subsidiary),
    getCardLandingData(profile.id)
  ]);

  const fullName = profile.firstName + " " + profile.lastName;
  const initials = (profile.firstName[0] ?? "") + (profile.lastName[0] ?? "");
  const whatsapp = profile.whatsapp || profile.mobile;
  const whatsappUrl = whatsapp ? whatsAppHref(whatsapp, profile.whatsappMessage) : undefined;
  const source = query.src === "nfc" || query.src === "qr" ? query.src : "web";

  const services: CardService[] = landing.services.length
    ? landing.services
    : (profile.services ?? []).slice(0, 4).map((title) => ({ title }));

  const resources: CardResource[] = landing.resources.length
    ? landing.resources
    : profile.brochureUrl
      ? [{
          title: profile.brochureLabel || "Brochure Vigilus",
          resourceType: "pdf",
          url: profile.brochureUrl
        }]
      : [];

  const campaign = landing.campaign ?? legacyCampaign(profile);
  const showCampaign = campaignIsActive(campaign);
  const about = landing.aboutText || profile.presentation;
  const primaryCtaLabel = landing.primaryCtaLabel || profile.commercialCtaLabel;
  const primaryCtaUrl = landing.primaryCtaUrl || profile.commercialCtaUrl;

  const themeStyle = {
    "--profile-primary": brand.primaryColor,
    "--profile-accent": brand.accentColor
  } as CSSProperties;

  return (
    <main className="v2-profile-shell" style={themeStyle}>
      <header className="v2-topbar">
        <a className="v2-brand" href={profile.website} target="_blank" rel="noreferrer">
          <img
            src={brand.logoUrl || "/branding/vigilus-groupe-sa.png"}
            alt={profile.subsidiary}
          />
        </a>
        <ProfileShareButton name={fullName} />
      </header>

      <section className={"v2-hero " + (landing.heroImageUrl ? "has-image" : "no-image")}>
        {landing.heroImageUrl && (
          <img className="v2-hero-background" src={landing.heroImageUrl} alt="" aria-hidden="true" />
        )}
        <div className="v2-hero-overlay" aria-hidden="true" />
        <div className="v2-hero-content">
          <div className="v2-hero-copy">
            <span className="v2-eyebrow">{landing.heroBadge || profile.subsidiary}</span>
            {landing.heroTitle && <p className="v2-hero-kicker">{landing.heroTitle}</p>}
            <h1>{fullName}</h1>
            <p className="v2-role">{profile.jobTitle}</p>
            <p className="v2-company">{profile.company}</p>
            {(landing.heroSubtitle || profile.presentation) && (
              <p className="v2-hero-subtitle">
                {landing.heroSubtitle || profile.presentation}
              </p>
            )}

            <div className="v2-hero-actions">
              <a className="v2-primary-action" href={"/p/" + profile.slug + "/contact.vcf"}>
                <ContactIcon />
                <span>Enregistrer le contact</span>
              </a>

              {whatsappUrl && (
                <a className="v2-secondary-action" href={whatsappUrl} target="_blank" rel="noreferrer">
                  <WhatsAppIcon />
                  <span>WhatsApp</span>
                </a>
              )}

              {primaryCtaLabel && primaryCtaUrl && (
                <a className="v2-text-action" href={primaryCtaUrl} target="_blank" rel="noreferrer">
                  <span>{primaryCtaLabel}</span>
                  <ArrowIcon />
                </a>
              )}
            </div>
          </div>

          <div className="v2-portrait-wrap">
            <div className="v2-portrait">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={"Portrait de " + fullName} />
              ) : (
                <span>{initials}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="v2-content">
        <section className="v2-about-section">
          <div className="v2-section-heading">
            <span>À propos</span>
            <h2>Un interlocuteur, des solutions concrètes.</h2>
          </div>

          <div className="v2-about-grid">
            <p>
              {about ||
                "Retrouvez mes coordonnées et les solutions Vigilus que je peux vous aider à mobiliser selon vos besoins."}
            </p>

            <dl className="v2-profile-facts">
              <div>
                <dt>Filiale</dt>
                <dd>{profile.subsidiary}</dd>
              </div>
              <div>
                <dt>Localisation</dt>
                <dd>{profile.city}, {profile.country}</dd>
              </div>
              {!!landing.languages.length && (
                <div>
                  <dt>Langues</dt>
                  <dd>{landing.languages.join(" · ")}</dd>
                </div>
              )}
            </dl>
          </div>
        </section>

        {!!services.length && (
          <section className="v2-section">
            <div className="v2-section-heading">
              <span>Nos solutions</span>
              <h2>Comment pouvons-nous vous accompagner ?</h2>
              <p>Une sélection des solutions que je peux mobiliser avec les équipes Vigilus.</p>
            </div>

            <div className="v2-services-grid">
              {services.slice(0, 4).map((service, index) => {
                const content = (
                  <>
                    <div className="v2-service-media">
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt="" />
                      ) : (
                        <span>{String(index + 1).padStart(2, "0")}</span>
                      )}
                    </div>
                    <div className="v2-service-copy">
                      <h3>{service.title}</h3>
                      {service.description && <p>{service.description}</p>}
                      {service.url && (
                        <span className="v2-service-link">
                          Découvrir <ArrowIcon />
                        </span>
                      )}
                    </div>
                  </>
                );

                return service.url ? (
                  <a
                    className="v2-service-card"
                    href={service.url}
                    target="_blank"
                    rel="noreferrer"
                    key={service.title + index}
                  >
                    {content}
                  </a>
                ) : (
                  <article className="v2-service-card" key={service.title + index}>
                    {content}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {showCampaign && campaign && (
          <section className="v2-campaign">
            {campaign.imageUrl && (
              <img className="v2-campaign-image" src={campaign.imageUrl} alt="" aria-hidden="true" />
            )}
            <div className="v2-campaign-overlay" aria-hidden="true" />
            <div className="v2-campaign-copy">
              <span>À la une</span>
              <h2>{campaign.title}</h2>
              {campaign.description && <p>{campaign.description}</p>}
              {campaign.ctaUrl && (
                <a href={campaign.ctaUrl} target="_blank" rel="noreferrer">
                  {campaign.ctaLabel || "En savoir plus"}
                  <ArrowIcon />
                </a>
              )}
            </div>
          </section>
        )}

        {!!resources.length && (
          <section className="v2-section">
            <div className="v2-section-heading">
              <span>Ressources</span>
              <h2>Pour aller plus loin</h2>
            </div>

            <div className="v2-resources-grid">
              {resources.slice(0, 3).map((resource, index) => (
                <a
                  className="v2-resource-card"
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  key={resource.title + index}
                >
                  <div className="v2-resource-thumb">
                    {resource.thumbnailUrl ? (
                      <img src={resource.thumbnailUrl} alt="" />
                    ) : (
                      <ResourceIcon type={resource.resourceType} />
                    )}
                  </div>
                  <div>
                    <span>{resource.resourceType}</span>
                    <h3>{resource.title}</h3>
                    {resource.description && <p>{resource.description}</p>}
                  </div>
                  <ExternalIcon />
                </a>
              ))}
            </div>
          </section>
        )}

        {!!landing.gallery.length && (
          <section className="v2-section">
            <div className="v2-section-heading">
              <span>En images</span>
              <h2>Vigilus sur le terrain</h2>
            </div>

            <div className={"v2-gallery v2-gallery-" + Math.min(landing.gallery.length, 5)}>
              {landing.gallery.slice(0, 5).map((item, index) => (
                <figure key={item.imageUrl + index}>
                  <img
                    src={item.imageUrl}
                    alt={item.altText || item.caption || "Vigilus sur le terrain"}
                  />
                  {item.caption && <figcaption>{item.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}

        {!!landing.highlights.length && (
          <section className="v2-trust">
            <div className="v2-section-heading">
              <span>Confiance</span>
              <h2>Vigilus en quelques repères</h2>
            </div>
            <div className="v2-highlights-grid">
              {landing.highlights.slice(0, 3).map((item, index) => (
                <div key={item.label + index}>
                  {item.value && <strong>{item.value}</strong>}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="v2-contact-section">
          <div className="v2-contact-info">
            <div className="v2-section-heading">
              <span>Contact</span>
              <h2>Échangeons.</h2>
              <p>Un besoin, un projet ou simplement une question ? Contactez-moi directement.</p>
            </div>

            <div className="v2-contact-links">
              {profile.mobile && (
                <a href={"tel:" + profile.mobile.replace(/\s/g, "")}>
                  <PhoneIcon />
                  <span><small>Mobile</small><strong>{profile.mobile}</strong></span>
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <WhatsAppIcon />
                  <span><small>WhatsApp</small><strong>Ouvrir la conversation</strong></span>
                </a>
              )}
              <a href={"mailto:" + profile.email}>
                <MailIcon />
                <span><small>E-mail</small><strong>{profile.email}</strong></span>
              </a>
              <a href={profile.website} target="_blank" rel="noreferrer">
                <WebIcon />
                <span>
                  <small>Site web</small>
                  <strong>{profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</strong>
                </span>
              </a>
              <a
                href={mapsHref(profile.address, profile.city, profile.country)}
                target="_blank"
                rel="noreferrer"
              >
                <PinIcon />
                <span><small>Adresse</small><strong>{profile.address}, {profile.city}</strong></span>
              </a>
            </div>

            {!!profile.socialLinks?.length && (
              <div className="v2-social-links">
                {profile.socialLinks.map((link) => (
                  <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>
                    {link.label}<ExternalIcon />
                  </a>
                ))}
              </div>
            )}
          </div>

          {landing.leadFormEnabled && (
            <div className="v2-lead-panel" id="lead-form">
              <span className="v2-eyebrow">Être recontacté</span>
              <h2>Parlez-moi de votre besoin.</h2>
              <p>Quelques informations suffisent. Votre demande me sera directement rattachée.</p>

              {query.lead === "1" && (
                <div className="v2-form-success">
                  Merci. Votre demande a bien été transmise à {profile.firstName}.
                </div>
              )}
              {query.leadError === "1" && (
                <div className="v2-form-error">
                  Renseignez votre nom et au moins un téléphone ou une adresse e-mail.
                </div>
              )}

              <form action={submitLeadAction} className="v2-lead-form">
                <input type="hidden" name="cardId" value={profile.id} />
                <input type="hidden" name="slug" value={profile.slug} />
                <input type="hidden" name="source" value={source} />
                <label className="v2-honeypot" aria-hidden="true">
                  Site
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>

                <label>
                  <span>Nom *</span>
                  <input name="name" required placeholder="Votre nom" />
                </label>
                <label>
                  <span>Entreprise</span>
                  <input name="company" placeholder="Votre entreprise" />
                </label>
                <div className="v2-form-row">
                  <label>
                    <span>Téléphone / WhatsApp</span>
                    <input name="phone" type="tel" placeholder="+221 ..." />
                  </label>
                  <label>
                    <span>E-mail</span>
                    <input name="email" type="email" placeholder="vous@entreprise.com" />
                  </label>
                </div>
                <label>
                  <span>Votre besoin</span>
                  <textarea name="message" rows={4} placeholder="Décrivez brièvement votre demande..." />
                </label>
                <button type="submit">
                  Envoyer ma demande
                  <ArrowIcon />
                </button>
              </form>
            </div>
          )}
        </section>

        <footer className="v2-footer">
          <div>
            <img src={brand.logoUrl || "/branding/vigilus-groupe-sa.png"} alt="" aria-hidden="true" />
            <span>
              <strong>{profile.company}</strong>
              <small>{profile.subsidiary}</small>
            </span>
          </div>
          <p>Carte professionnelle digitale · NFC · QR</p>
        </footer>
      </div>

      <nav className="v2-mobile-dock" aria-label="Actions rapides">
        <a href={"/p/" + profile.slug + "/contact.vcf"}>
          <ContactIcon />
          <span>Enregistrer</span>
        </a>
        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <WhatsAppIcon />
            <span>WhatsApp</span>
          </a>
        ) : (
          <a href={"mailto:" + profile.email}>
            <MailIcon />
            <span>E-mail</span>
          </a>
        )}
      </nav>
    </main>
  );
}
