import { saveCardAction } from "@/app/admin/actions";
import type { DigitalCard } from "@/lib/profiles";
import { AdminServiceFields } from "@/components/admin-service-fields";
import { AdminCardFormShell } from "@/components/admin-card-form-shell";

const subsidiaries = [
  "Vigilus Sénégal",
  "Vigilus Côte d’Ivoire",
  "Vigilus Sierra Leone",
  "Vigilus Guinée",
  "Vigilus Mobility",
  "Vigilus Properties",
  "Vigilus Facilities",
  "Vigilus International",
  "Vigilus Dubaï",
  "VIGILUS Group"
];

function socialValue(card: DigitalCard | undefined, label: string) {
  return card?.socialLinks?.find((link) => link.label === label)?.url ?? "";
}

export function AdminCardForm({ card }: { card?: DigitalCard }) {
  return (
    <AdminCardFormShell action={saveCardAction}>
      {card?.id && <input type="hidden" name="id" value={card.id} />}

      <div className="admin-form-section">
        <div className="admin-section-heading">
          <div><span>Identité</span><h2>Collaborateur</h2></div>
          <label className="admin-switch">
            <input type="checkbox" name="active" defaultChecked={card?.active ?? true} />
            <span>Carte active</span>
          </label>
        </div>

        <div className="admin-grid admin-grid-2">
          <label><span>Prénom *</span><input name="firstName" required defaultValue={card?.firstName ?? ""} /></label>
          <label><span>Nom *</span><input name="lastName" required defaultValue={card?.lastName ?? ""} /></label>
          <label><span>Poste *</span><input name="jobTitle" required defaultValue={card?.jobTitle ?? ""} /></label>
          <label>
            <span>Filiale *</span>
            <input name="subsidiary" list="subsidiaries" required defaultValue={card?.subsidiary ?? "Vigilus Sénégal"} />
            <datalist id="subsidiaries">
              {subsidiaries.map((subsidiary) => <option key={subsidiary} value={subsidiary} />)}
            </datalist>
          </label>
          <label><span>Entreprise</span><input name="company" defaultValue={card?.company ?? "VIGILUS Group"} /></label>
          <label>
            <span>URL publique</span>
            <div className="input-prefix"><span>/p/</span><input name="slug" defaultValue={card?.slug ?? ""} placeholder="prenom-nom" /></div>
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <div className="admin-section-heading"><div><span>Contact</span><h2>Coordonnées du collaborateur & de l’entreprise</h2></div></div>
        <div className="admin-grid admin-grid-2">
          <label><span>Téléphone portable</span><input name="mobile" type="tel" defaultValue={card?.mobile ?? ""} /></label>
          <label><span>WhatsApp</span><input name="whatsapp" type="tel" defaultValue={card?.whatsapp ?? card?.mobile ?? ""} placeholder="+221 77 000 00 00" /></label>
          <label><span>Standard de l’entreprise</span><input name="phone" type="tel" defaultValue={card?.phone ?? "+221 33 867 77 32"} /></label>
          <label className="admin-span-2">
            <span>Message WhatsApp prérempli</span>
            <textarea
              name="whatsappMessage"
              rows={3}
              defaultValue={card?.whatsappMessage ?? ""}
              placeholder="Bonjour, je viens de consulter votre carte Vigilus et je souhaite échanger concernant..."
            />
            <small className="field-hint">Ce message sera préparé automatiquement quand le visiteur ouvre WhatsApp.</small>
          </label>
          <label><span>E-mail *</span><input name="email" type="email" required defaultValue={card?.email ?? ""} /></label>
          <label><span>Site web de l’entreprise *</span><input name="website" type="url" required defaultValue={card?.website ?? "https://www.groupevigilus.com"} /></label>
          <label className="admin-span-2"><span>Adresse des bureaux *</span><input name="address" required defaultValue={card?.address ?? ""} /><small className="field-hint">Cette adresse est utilisée pour la carte et l’itinéraire sur le profil public.</small></label>
          <label><span>Ville *</span><input name="city" required defaultValue={card?.city ?? "Dakar"} /></label>
          <label><span>Pays *</span><input name="country" required defaultValue={card?.country ?? "Sénégal"} /></label>
        </div>
      </div>

      <div className="admin-form-section">
        <div className="admin-section-heading"><div><span>Profil du collaborateur</span><h2>Photo, présentation & réseaux personnels</h2></div></div>

        {card?.photoUrl && (
          <div className="current-photo">
            <img src={card.photoUrl} alt={"Photo de " + card.firstName + " " + card.lastName} />
            <div><strong>Photo actuelle</strong><small>Importer une nouvelle photo la remplacera.</small></div>
          </div>
        )}

        <div className="admin-grid admin-grid-2">
          <label className="admin-span-2">
            <span>Importer la photo du collaborateur</span>
            <input name="photoFile" type="file" accept="image/jpeg,image/png,image/webp" />
            <small className="field-hint">JPG, PNG ou WEBP · limite de 4 Mo pour l’ensemble des images sélectionnées.</small>
          </label>
          <label className="admin-span-2">
            <span>Ou utiliser une URL de photo</span>
            <input name="photoUrl" type="text" defaultValue={card?.photoUrl ?? ""} placeholder="https://..." />
          </label>
          <label className="admin-span-2"><span>Présentation</span><textarea name="presentation" rows={5} defaultValue={card?.presentation ?? ""} placeholder="Courte présentation professionnelle..." /></label>
          <label className="admin-span-2">
            <span>Lien de prise de rendez-vous</span>
            <input name="appointmentUrl" type="url" pattern="https://.*" title="Utilisez un lien de rendez-vous HTTPS valide." defaultValue={card?.appointmentUrl ?? ""} placeholder="https://calendly.com/..." />
            <small className="field-hint">Lien HTTPS de votre agenda en ligne. Sans lien, le visiteur pourra préparer une demande de rendez-vous.</small>
          </label>
          <label className="admin-span-2"><span>LinkedIn personnel du collaborateur</span><input name="linkedin" type="url" defaultValue={socialValue(card, "LinkedIn")} placeholder="https://www.linkedin.com/in/..." /><small className="field-hint">Les pages de l’entreprise se configurent dans <a href="/admin/filiales">Filiales</a>.</small></label>
          <label><span>Facebook personnel</span><input name="facebook" type="url" defaultValue={socialValue(card, "Facebook")} /></label>
          <label><span>Instagram personnel</span><input name="instagram" type="url" defaultValue={socialValue(card, "Instagram")} /></label>
          <label><span>X personnel</span><input name="x" type="url" defaultValue={socialValue(card, "X")} /></label>
        </div>
      </div>

      <div className="admin-form-section">
        <div className="admin-section-heading"><div><span>Entreprise</span><h2>Couverture & présentation</h2></div></div>
        {card?.coverUrl && (
          <div className="current-photo">
            <img src={card.coverUrl} alt="Photo de couverture actuelle" />
            <div><strong>Couverture actuelle</strong><small>Importez une image panoramique pour un meilleur rendu.</small></div>
          </div>
        )}
        <div className="admin-grid admin-grid-2">
          <label>
            <span>Importer une photo de couverture</span>
            <input name="coverFile" type="file" accept="image/jpeg,image/png,image/webp" />
            <small className="field-hint">Format paysage conseillé, au moins 1 600 × 600 px. JPG, PNG ou WEBP · 4 Mo pour toutes les images sélectionnées.</small>
          </label>
          <label>
            <span>Ou utiliser une URL de couverture</span>
            <input name="coverUrl" type="text" defaultValue={card?.coverUrl ?? ""} placeholder="https://..." />
            <small className="field-hint">Effacez le lien pour utiliser la couverture par défaut.</small>
          </label>
          <label className="admin-span-2">
            <span>Présentation de l’entreprise</span>
            <textarea name="companyPresentation" rows={4} defaultValue={card?.companyPresentation ?? ""} placeholder="Présentez l’activité et les expertises de votre entreprise..." />
            <small className="field-hint">Affichée dans un espace distinct de la présentation du collaborateur.</small>
          </label>
        </div>
      </div>


      <div className="admin-form-section">
        <div className="admin-section-heading">
          <div>
            <span>Commercial</span>
            <h2>Services & mise en avant</h2>
          </div>
        </div>

        <div className="admin-grid admin-grid-2">
          <input type="hidden" name="servicesEditor" value="1" />
          <AdminServiceFields services={card?.services} serviceImages={card?.serviceImages} />

          <label>
            <span>Libellé du CTA principal</span>
            <input
              name="commercialCtaLabel"
              defaultValue={card?.commercialCtaLabel ?? ""}
              placeholder="Parler de votre besoin"
            />
          </label>
          <label>
            <span>Lien du CTA principal</span>
            <input
              name="commercialCtaUrl"
              type="url"
              defaultValue={card?.commercialCtaUrl ?? ""}
              placeholder="https://..."
            />
          </label>

          <label className="admin-span-2">
            <span>Titre de l’offre / actualité</span>
            <input
              name="offerTitle"
              defaultValue={card?.offerTitle ?? ""}
              placeholder="Une offre à mettre en avant"
            />
          </label>
          <label className="admin-span-2">
            <span>Texte court de l’offre</span>
            <textarea
              name="offerText"
              rows={3}
              defaultValue={card?.offerText ?? ""}
              placeholder="Une phrase courte, concrète et commerciale."
            />
          </label>
          <label>
            <span>Lien de l’offre</span>
            <input name="offerUrl" type="url" defaultValue={card?.offerUrl ?? ""} placeholder="https://..." />
          </label>
          <div className="admin-grid admin-grid-2 admin-span-2">
            <label>
              <span>Début d’affichage</span>
              <input name="offerStartDate" type="date" defaultValue={card?.offerStartDate ?? ""} />
            </label>
            <label>
              <span>Fin d’affichage</span>
              <input name="offerEndDate" type="date" defaultValue={card?.offerEndDate ?? ""} />
            </label>
          </div>

          <label>
            <span>Libellé brochure / catalogue</span>
            <input
              name="brochureLabel"
              defaultValue={card?.brochureLabel ?? ""}
              placeholder="Voir notre brochure"
            />
          </label>
          <label>
            <span>Lien brochure / catalogue</span>
            <input name="brochureUrl" type="url" defaultValue={card?.brochureUrl ?? ""} placeholder="https://..." />
          </label>
        </div>

        <p className="admin-help">
          Ces éléments restent optionnels. Le profil public masque automatiquement les blocs vides pour garder un rendu très clean.
        </p>
      </div>

      <div className="admin-form-section">
        <div className="admin-section-heading"><div><span>NFC</span><h2>Comportement de la carte</h2></div></div>
        <label>
          <span>Après le scan</span>
          <select name="nfcMode" defaultValue={card?.nfcMode ?? "profile"}>
            <option value="profile">Afficher d’abord la carte digitale</option>
            <option value="vcard">Ouvrir directement la vCard</option>
          </select>
        </label>
        {card?.nfcToken && (
          <p className="admin-help">Token NFC : <code>{card.nfcToken}</code>. Il reste stable même lorsque les coordonnées changent.</p>
        )}
      </div>

      <div className="admin-form-actions">
        <a href="/admin">Annuler</a>
        <button type="submit">{card ? "Enregistrer les modifications" : "Créer la carte"}</button>
      </div>
    </AdminCardFormShell>
  );
}
