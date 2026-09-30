import { saveLandingAction } from "@/app/admin/actions";
import type { CardLandingData } from "@/lib/landing";

const SERVICE_SLOTS = 4;
const RESOURCE_SLOTS = 3;
const GALLERY_SLOTS = 5;
const HIGHLIGHT_SLOTS = 3;

export function AdminLandingForm({
  cardId,
  landing
}: {
  cardId: number;
  landing: CardLandingData;
}) {
  const services = Array.from({ length: SERVICE_SLOTS }, (_, index) => landing.services[index]);
  const resources = Array.from({ length: RESOURCE_SLOTS }, (_, index) => landing.resources[index]);
  const gallery = Array.from({ length: GALLERY_SLOTS }, (_, index) => landing.gallery[index]);
  const highlights = Array.from({ length: HIGHLIGHT_SLOTS }, (_, index) => landing.highlights[index]);

  return (
    <form className="admin-form admin-landing-form" action={saveLandingAction}>
      <input type="hidden" name="cardId" value={cardId} />

      <nav className="admin-section-nav" aria-label="Sections de la landing page">
        <a href="#landing-hero">Hero</a>
        <a href="#landing-services">Services</a>
        <a href="#landing-campaign">Campagne</a>
        <a href="#landing-resources">Ressources</a>
        <a href="#landing-gallery">Galerie</a>
        <a href="#landing-trust">Confiance</a>
        <a href="#landing-conversion">Conversion</a>
      </nav>

      <div className="admin-form-section" id="landing-hero">
        <div className="admin-section-heading">
          <div><span>Landing page</span><h2>Hero & présentation</h2></div>
        </div>

        <div className="admin-grid admin-grid-2">
          <label>
            <span>Badge</span>
            <input name="heroBadge" defaultValue={landing.heroBadge ?? ""} placeholder="Vigilus Sénégal" />
          </label>
          <label>
            <span>Langues</span>
            <input
              name="languages"
              defaultValue={landing.languages.join(", ")}
              placeholder="Français, Anglais, Wolof"
            />
          </label>

          <label className="admin-span-2">
            <span>Titre principal</span>
            <input
              name="heroTitle"
              defaultValue={landing.heroTitle ?? ""}
              placeholder="Des solutions pensées pour vos enjeux."
            />
          </label>

          <label className="admin-span-2">
            <span>Sous-titre</span>
            <textarea
              name="heroSubtitle"
              rows={3}
              defaultValue={landing.heroSubtitle ?? ""}
              placeholder="Une phrase courte qui présente la valeur apportée par le collaborateur et Vigilus."
            />
          </label>

          <label className="admin-span-2">
            <span>Image bannière</span>
            <input name="heroImageFile" type="file" accept="image/jpeg,image/png,image/webp" />
            <small className="field-hint">Une image horizontale, sobre et liée au métier donne le meilleur rendu.</small>
          </label>

          <label className="admin-span-2">
            <span>Ou URL bannière</span>
            <input name="heroImageUrl" defaultValue={landing.heroImageUrl ?? ""} placeholder="https://..." />
          </label>

          <label className="admin-span-2">
            <span>À propos</span>
            <textarea
              name="aboutText"
              rows={5}
              defaultValue={landing.aboutText ?? ""}
              placeholder="Présentation humaine et professionnelle..."
            />
          </label>

          <label>
            <span>CTA principal</span>
            <input
              name="primaryCtaLabel"
              defaultValue={landing.primaryCtaLabel ?? ""}
              placeholder="Parler de votre besoin"
            />
          </label>
          <label>
            <span>Lien CTA</span>
            <input
              name="primaryCtaUrl"
              type="url"
              defaultValue={landing.primaryCtaUrl ?? ""}
              placeholder="https://..."
            />
          </label>

          <label className="admin-span-2">
            <span>Lien de prise de rendez-vous</span>
            <input name="bookingUrl" type="url" defaultValue={landing.bookingUrl ?? ""} placeholder="https://..." />
          </label>
        </div>
      </div>

      <div className="admin-form-section" id="landing-services">
        <div className="admin-section-heading">
          <div><span>Commercial</span><h2>Services mis en avant</h2></div>
        </div>
        <p className="admin-help">Jusqu’à quatre services principaux. Chaque service peut avoir sa propre image et sa page de destination.</p>

        <div className="admin-repeat-stack">
          {services.map((service, index) => (
            <fieldset className="admin-repeat-card" key={index}>
              <legend>Service {index + 1}</legend>
              <div className="admin-grid admin-grid-2">
                <label>
                  <span>Titre</span>
                  <input name={"serviceTitle" + index} defaultValue={service?.title ?? ""} placeholder="Sécurité électronique" />
                </label>
                <label>
                  <span>Lien</span>
                  <input name={"serviceUrl" + index} type="url" defaultValue={service?.url ?? ""} placeholder="https://..." />
                </label>
                <label className="admin-span-2">
                  <span>Description courte</span>
                  <textarea name={"serviceDescription" + index} rows={2} defaultValue={service?.description ?? ""} />
                </label>
                <label>
                  <span>Image</span>
                  <input name={"serviceImageFile" + index} type="file" accept="image/jpeg,image/png,image/webp" />
                </label>
                <label>
                  <span>Ou URL image</span>
                  <input name={"serviceImageUrl" + index} defaultValue={service?.imageUrl ?? ""} />
                </label>
              </div>
            </fieldset>
          ))}
        </div>
      </div>

      <div className="admin-form-section" id="landing-campaign">
        <div className="admin-section-heading">
          <div><span>Mise en avant</span><h2>Bannière commerciale</h2></div>
          <label className="admin-switch">
            <input type="checkbox" name="campaignActive" defaultChecked={landing.campaign?.active ?? true} />
            <span>Active</span>
          </label>
        </div>

        <div className="admin-grid admin-grid-2">
          <label className="admin-span-2">
            <span>Titre</span>
            <input name="campaignTitle" defaultValue={landing.campaign?.title ?? ""} placeholder="Une problématique spécifique ?" />
          </label>
          <label className="admin-span-2">
            <span>Texte</span>
            <textarea name="campaignDescription" rows={3} defaultValue={landing.campaign?.description ?? ""} />
          </label>
          <label>
            <span>CTA</span>
            <input name="campaignCtaLabel" defaultValue={landing.campaign?.ctaLabel ?? ""} placeholder="Demander un devis" />
          </label>
          <label>
            <span>Lien CTA</span>
            <input name="campaignCtaUrl" type="url" defaultValue={landing.campaign?.ctaUrl ?? ""} placeholder="https://..." />
          </label>
          <label>
            <span>Image</span>
            <input name="campaignImageFile" type="file" accept="image/jpeg,image/png,image/webp" />
          </label>
          <label>
            <span>Ou URL image</span>
            <input name="campaignImageUrl" defaultValue={landing.campaign?.imageUrl ?? ""} />
          </label>
          <label>
            <span>Début</span>
            <input name="campaignStartsAt" type="date" defaultValue={landing.campaign?.startsAt ?? ""} />
          </label>
          <label>
            <span>Fin</span>
            <input name="campaignEndsAt" type="date" defaultValue={landing.campaign?.endsAt ?? ""} />
          </label>
        </div>
      </div>

      <div className="admin-form-section" id="landing-resources">
        <div className="admin-section-heading">
          <div><span>Contenus</span><h2>Ressources</h2></div>
        </div>

        <div className="admin-repeat-stack">
          {resources.map((resource, index) => (
            <fieldset className="admin-repeat-card" key={index}>
              <legend>Ressource {index + 1}</legend>
              <div className="admin-grid admin-grid-2">
                <label>
                  <span>Titre</span>
                  <input name={"resourceTitle" + index} defaultValue={resource?.title ?? ""} placeholder="Brochure Vigilus" />
                </label>
                <label>
                  <span>Type</span>
                  <select name={"resourceType" + index} defaultValue={resource?.resourceType ?? "pdf"}>
                    <option value="pdf">PDF</option>
                    <option value="catalogue">Catalogue</option>
                    <option value="video">Vidéo</option>
                    <option value="link">Lien</option>
                  </select>
                </label>
                <label className="admin-span-2">
                  <span>Description</span>
                  <input name={"resourceDescription" + index} defaultValue={resource?.description ?? ""} />
                </label>
                <label className="admin-span-2">
                  <span>URL de la ressource</span>
                  <input name={"resourceUrl" + index} type="url" defaultValue={resource?.url ?? ""} placeholder="https://..." />
                </label>
                <label>
                  <span>Miniature</span>
                  <input name={"resourceThumbnailFile" + index} type="file" accept="image/jpeg,image/png,image/webp" />
                </label>
                <label>
                  <span>Ou URL miniature</span>
                  <input name={"resourceThumbnailUrl" + index} defaultValue={resource?.thumbnailUrl ?? ""} />
                </label>
              </div>
            </fieldset>
          ))}
        </div>
      </div>

      <div className="admin-form-section" id="landing-gallery">
        <div className="admin-section-heading">
          <div><span>Médias</span><h2>Galerie</h2></div>
        </div>

        <div className="admin-repeat-stack">
          {gallery.map((item, index) => (
            <fieldset className="admin-repeat-card" key={index}>
              <legend>Image {index + 1}</legend>
              <div className="admin-grid admin-grid-2">
                <label>
                  <span>Importer</span>
                  <input name={"galleryFile" + index} type="file" accept="image/jpeg,image/png,image/webp" />
                </label>
                <label>
                  <span>Ou URL image</span>
                  <input name={"galleryImageUrl" + index} defaultValue={item?.imageUrl ?? ""} />
                </label>
                <label>
                  <span>Légende</span>
                  <input name={"galleryCaption" + index} defaultValue={item?.caption ?? ""} />
                </label>
                <label>
                  <span>Texte alternatif</span>
                  <input name={"galleryAlt" + index} defaultValue={item?.altText ?? ""} />
                </label>
              </div>
            </fieldset>
          ))}
        </div>
      </div>

      <div className="admin-form-section" id="landing-trust">
        <div className="admin-section-heading">
          <div><span>Crédibilité</span><h2>Preuves de confiance</h2></div>
        </div>

        <div className="admin-grid admin-grid-3">
          {highlights.map((item, index) => (
            <div className="admin-mini-card" key={index}>
              <label>
                <span>Valeur</span>
                <input name={"highlightValue" + index} defaultValue={item?.value ?? ""} placeholder="4 pays" />
              </label>
              <label>
                <span>Libellé</span>
                <input name={"highlightLabel" + index} defaultValue={item?.label ?? ""} placeholder="Présence régionale" />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-form-section" id="landing-conversion">
        <div className="admin-section-heading">
          <div><span>Conversion</span><h2>Capture de prospects</h2></div>
          <label className="admin-switch">
            <input type="checkbox" name="leadFormEnabled" defaultChecked={landing.leadFormEnabled} />
            <span>Formulaire activé</span>
          </label>
        </div>
        <p className="admin-help">
          Les demandes reçues sont enregistrées dans Neon et rattachées automatiquement à cette carte.
        </p>
      </div>

      <div className="admin-form-actions">
        <a href={"/admin/cartes/" + cardId}>Annuler</a>
        <button type="submit">Enregistrer la landing page</button>
      </div>
    </form>
  );
}
