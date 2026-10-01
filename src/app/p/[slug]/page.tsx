import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  UserRoundPlus,
} from "lucide-react";
import { ProfileShareButton } from "@/components/profile-share-button";
import { ProfileAppointment } from "@/components/profile-appointment";
import { ProfileImage } from "@/components/profile-image";
import { ProfileSocialIcon } from "@/components/profile-social-icon";
import { getBrandConfig, getProfileBySlug } from "@/lib/db";
import { serviceImageFor } from "@/lib/profile-visuals";
import { calendarUrl, contactPhone } from "@/lib/profile-appointment";
import "./profile.css";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

function offerIsActive(startDate?: string, endDate?: string) {
  const today = new Date().toISOString().slice(0, 10);
  return !(startDate && startDate > today) && !(endDate && endDate < today);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const profile = await getProfileBySlug((await params).slug);
  if (!profile) return { title: "Profil introuvable" };
  return {
    title: `${profile.firstName} ${profile.lastName}`,
    description: `${profile.jobTitle} — ${profile.subsidiary}`,
    robots: { index: false, follow: false },
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const profile = await getProfileBySlug((await params).slug);
  if (!profile) notFound();
  const brand = await getBrandConfig(profile.subsidiary);
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = (profile.firstName[0] ?? "") + (profile.lastName[0] ?? "");
  const whatsapp = profile.whatsapp || profile.mobile;
  const whatsappNumber = contactPhone(whatsapp);
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}${profile.whatsappMessage ? `?text=${encodeURIComponent(profile.whatsappMessage)}` : ""}`
    : undefined;
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const address = [profile.address, profile.city, profile.country]
    .filter(Boolean)
    .join(", ");
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const logoUrl = brand.logoUrl || "/branding/vigilus-groupe-sa.png";
  const vcardHref = `/p/${profile.slug}/contact.vcf`;
  const services = profile.services ?? [];
  const showOffer =
    Boolean(profile.offerTitle || profile.offerText) &&
    offerIsActive(profile.offerStartDate, profile.offerEndDate);
  const appointmentProps = {
    name: fullName,
    email: profile.email,
    whatsapp,
    appointmentUrl: profile.appointmentUrl,
  };
  const themeStyle = {
    "--profile-primary": brand.primaryColor,
    "--profile-accent": brand.accentColor,
  } as CSSProperties;

  return (
    <main className="vp-shell" style={themeStyle}>
      <div className="vp-frame">
        <header className="vp-topbar">
          <a className="vp-brand" href="#profil" aria-label="Revenir au profil">
            <Image
              src={logoUrl}
              alt={profile.company}
              width={150}
              height={54}
              unoptimized
            />
          </a>
          <div className="vp-topbar-right">
            <ProfileShareButton name={fullName} />
          </div>
        </header>

        <section className="vp-hero" id="profil" aria-labelledby="profile-name">
          <div className="vp-cover">
            <ProfileImage
              src={profile.coverUrl || "/profile-images/cover.webp"}
              fallbackSrc="/profile-images/cover.webp"
              alt=""
              fill
              sizes="(max-width: 1120px) 100vw, 1120px"
              priority
              className="vp-cover-image"
            />
            <div className="vp-cover-shade" />
            <a className="vp-cover-company" href="#entreprise">
              <Building2 size={15} />
              <span>{profile.subsidiary}</span>
              <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="vp-identity">
            <div className="vp-avatar">
              {profile.photoUrl ? (
                <ProfileImage
                  src={profile.photoUrl}
                  alt={`Portrait de ${fullName}`}
                  fill
                  sizes="144px"
                  priority
                  fallbackText={initials}
                />
              ) : (
                <span className="vp-initials" aria-label={fullName}>
                  {initials}
                </span>
              )}
            </div>
            <div className="vp-identity-row">
              <div className="vp-name">
                <h1 id="profile-name">{fullName}</h1>
                <p className="vp-role">{profile.jobTitle}</p>
                <div className="vp-identity-meta">
                  <a href="#entreprise">
                    <Building2 size={15} />
                    {profile.subsidiary}
                  </a>
                  {location && (
                    <span>
                      <MapPin size={15} />
                      {location}
                    </span>
                  )}
                </div>
              </div>
              <div className="vp-hero-actions">
                <a className="vp-button vp-button-primary" href={vcardHref}>
                  <UserRoundPlus size={19} />
                  Enregistrer le contact
                </a>
                <ProfileAppointment
                  {...appointmentProps}
                  className="vp-button vp-button-secondary"
                />
              </div>
            </div>
          </div>
          <nav className="vp-section-nav" aria-label="Sections du profil">
            <a href="#contact">
              Mon profil <ArrowDown size={13} />
            </a>
            <a href="#entreprise">L’entreprise</a>
            {!!services.length && <a href="#services">Nos services</a>}
            {address && <a href="#localisation">Nous trouver</a>}
          </nav>
        </section>

        <section
          className="vp-personal"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="vp-personal-copy">
            <h2 id="contact-title">À propos</h2>
            {profile.presentation && <p>{profile.presentation}</p>}
            {!!profile.socialLinks?.length && (
              <div
                className="vp-socials"
                aria-label="Mes réseaux professionnels"
              >
                {profile.socialLinks.map((link, index) => (
                  <a
                    key={`${link.url}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${link.label} personnel de ${fullName}`}
                  >
                    <ProfileSocialIcon label={link.label} />
                    {link.label.toLowerCase() === "linkedin"
                      ? "Mon LinkedIn"
                      : link.label}
                    <ArrowUpRight size={14} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="vp-direct-contact">
            <h2 className="vp-contact-title">Coordonnées</h2>
            {profile.mobile && (
              <a
                className="vp-contact-row"
                href={`tel:${profile.mobile.replace(/\s/g, "")}`}
              >
                <span className="vp-icon-tile">
                  <Phone size={19} />
                </span>
                <span>
                  <small>Téléphone mobile</small>
                  <strong>{profile.mobile}</strong>
                </span>
                <ArrowUpRight size={17} />
              </a>
            )}
            {profile.email && (
              <a className="vp-contact-row" href={`mailto:${profile.email}`}>
                <span className="vp-icon-tile">
                  <Mail size={19} />
                </span>
                <span>
                  <small>E-mail professionnel</small>
                  <strong>{profile.email}</strong>
                </span>
                <ArrowUpRight size={17} />
              </a>
            )}
            {whatsappHref && (
              <a
                className="vp-whatsapp"
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={20} />
                <span>Échanger sur WhatsApp</span>
                <ArrowUpRight size={17} />
              </a>
            )}
          </div>
        </section>

        <section
          className="vp-company-section"
          id="entreprise"
          aria-labelledby="company-title"
        >
          <div className="vp-section-heading">
            <span className="vp-eyebrow">L’entreprise</span>
            <span className="vp-section-line" />
          </div>
          <div className="vp-company-intro">
            <div className="vp-company-logo">
              <Image src={logoUrl} alt="" width={114} height={80} unoptimized />
            </div>
            <div className="vp-company-name">
              <span>{profile.company}</span>
              <h2 id="company-title">{profile.subsidiary}</h2>
              {profile.companyPresentation && (
                <p>{profile.companyPresentation}</p>
              )}
              {!address && profile.phone && (
                <a
                  className="vp-company-phone vp-company-phone-inline"
                  href={`tel:${profile.phone.replace(/\s/g, "")}`}
                >
                  <Phone size={15} />
                  <span>Standard de l’entreprise</span>
                  <strong>{profile.phone}</strong>
                </a>
              )}
            </div>
            {profile.website && (
              <a
                className="vp-company-website"
                href={profile.website}
                target="_blank"
                rel="noreferrer"
              >
                <Globe2 size={18} />
                <span>Visiter notre site</span>
                <ArrowUpRight size={16} />
              </a>
            )}
          </div>

          {!!services.length && (
            <div className="vp-services" id="services">
              <div className="vp-services-heading">
                <div>
                  <h2>Nos services</h2>
                </div>
              </div>
              <div className="vp-service-grid">
                {services.map((service, index) => {
                  const image =
                    profile.serviceImages?.find((item) => item.name === service)
                      ?.imageUrl || serviceImageFor(service);
                  return (
                    <article
                      className="vp-service-card"
                      key={`${service}-${index}`}
                    >
                      <div className="vp-service-image">
                        <ProfileImage
                          src={image}
                          fallbackSrc={serviceImageFor(service)}
                          alt={service}
                          fill
                          sizes="(max-width: 600px) 50vw, (max-width: 900px) 45vw, 260px"
                        />
                        <span className="vp-service-number">
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                      </div>
                      <div className="vp-service-caption">
                        <h3>{service}</h3>
                        <a
                          href="#rendez-vous"
                          aria-label={`Échanger au sujet de ${service}`}
                        >
                          <ArrowUpRight size={19} />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {((profile.commercialCtaLabel && profile.commercialCtaUrl) ||
            profile.brochureUrl) && (
            <div className="vp-company-resources">
              {profile.commercialCtaLabel && profile.commercialCtaUrl && (
                <a
                  className="vp-text-link"
                  href={profile.commercialCtaUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.commercialCtaLabel}
                  <ArrowRight size={17} />
                </a>
              )}
              {profile.brochureUrl && (
                <a
                  className="vp-text-link vp-brochure"
                  href={profile.brochureUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ArrowDownToLine size={17} />
                  {profile.brochureLabel || "Consulter notre brochure"}
                </a>
              )}
            </div>
          )}
          {showOffer && (
            <aside className="vp-offer">
              <div>
                {profile.offerTitle && <h3>{profile.offerTitle}</h3>}
                {profile.offerText && <p>{profile.offerText}</p>}
              </div>
              {profile.offerUrl && (
                <a
                  className="vp-button vp-button-secondary"
                  href={profile.offerUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  En savoir plus
                  <ArrowUpRight size={16} />
                </a>
              )}
            </aside>
          )}

          {!!brand.socialLinks?.length && (
            <section
              className="vp-company-socials"
              aria-labelledby="company-socials-title"
            >
              <div className="vp-follow-heading">
                <h2 id="company-socials-title">Suivez-nous</h2>
                <span>{profile.company}</span>
              </div>
              <div className="vp-follow-links">
                {brand.socialLinks.map((link) => (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={link.label}
                    aria-label={`${profile.company} sur ${link.label}`}
                  >
                    <span className="vp-follow-icon">
                      <ProfileSocialIcon label={link.label} />
                    </span>
                    <span>{link.label}</span>
                    <ArrowUpRight size={17} />
                  </a>
                ))}
              </div>
            </section>
          )}

          <div
            className={`vp-visit-grid${!address ? " vp-visit-grid-single" : ""}`}
          >
            {address && (
              <section
                className="vp-location-card"
                id="localisation"
                aria-labelledby="location-title"
              >
                <div className="vp-location-heading">
                  <span className="vp-icon-tile">
                    <MapPin size={21} />
                  </span>
                  <div>
                    <h2 id="location-title">Nos bureaux</h2>
                  </div>
                </div>
                <div className="vp-map">
                  <iframe
                    title={`Localisation de ${profile.subsidiary} : ${address}`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                  <a href={mapsHref} target="_blank" rel="noreferrer">
                    Ouvrir dans Maps
                    <ArrowUpRight size={15} />
                  </a>
                </div>
                <div className="vp-address">
                  <div>
                    <strong>{profile.subsidiary}</strong>
                    <p>{address}</p>
                  </div>
                  <a
                    className="vp-directions"
                    href={mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Itinéraire vers ${profile.subsidiary}`}
                  >
                    <ArrowUpRight size={20} />
                  </a>
                </div>
                {profile.phone && (
                  <a
                    className="vp-company-phone"
                    href={`tel:${profile.phone.replace(/\s/g, "")}`}
                  >
                    <Phone size={15} />
                    <span>Standard de l’entreprise</span>
                    <strong>{profile.phone}</strong>
                  </a>
                )}
              </section>
            )}
            <section
              className="vp-meeting-card"
              id="rendez-vous"
              aria-labelledby="meeting-title"
            >
              <h2 id="meeting-title">Rendez-vous</h2>
              <div className="vp-meeting-person">
                <span className="vp-mini-avatar">
                  {profile.photoUrl ? (
                    <ProfileImage
                      src={profile.photoUrl}
                      alt=""
                      fill
                      sizes="60px"
                      fallbackText={initials}
                    />
                  ) : (
                    initials
                  )}
                </span>
                <span>
                  <strong>{fullName}</strong>
                  <small>{profile.jobTitle}</small>
                </span>
              </div>
              <ProfileAppointment
                {...appointmentProps}
                triggerLabel={
                  calendarUrl(profile.appointmentUrl)
                    ? "Choisir un créneau"
                    : "Proposer un rendez-vous"
                }
                triggerIcon="arrow"
              />
              <small className="vp-meeting-note">
                {calendarUrl(profile.appointmentUrl)
                  ? "Choisissez un créneau dans mon agenda."
                  : "Le créneau sera confirmé directement avec vous."}
              </small>
            </section>
          </div>
        </section>
        <footer className="vp-footer">
          <span>{profile.company}</span>
          <a href="#profil">
            Retour en haut <ArrowUpRight size={14} />
          </a>
        </footer>
      </div>
      <nav className="vp-mobile-dock" aria-label="Actions rapides">
        <a className="vp-button vp-button-primary" href={vcardHref}>
          <UserRoundPlus size={18} />
          Enregistrer
        </a>
        <ProfileAppointment
          {...appointmentProps}
          className="vp-button vp-button-secondary"
        />
      </nav>
    </main>
  );
}
