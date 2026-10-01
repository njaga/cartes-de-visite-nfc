import { saveBrandAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllBrandConfigs } from "@/lib/db";

type SubsidiariesPageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export const dynamic = "force-dynamic";

export default async function SubsidiariesPage({ searchParams }: SubsidiariesPageProps) {
  await requireAdmin();
  const { saved } = await searchParams;
  const brands = await getAllBrandConfigs();

  return (
    <main className="admin-shell">
      <section className="admin-content">
        <div className="admin-page-heading">
          <div>
            <a className="admin-back" href="/admin">← Retour au tableau de bord</a>
            <span>Identité visuelle</span>
            <h1>Filiales</h1>
            <p>Définissez le logo, les couleurs et les pages sociales de chaque filiale.</p>
          </div>
        </div>

        {saved && <p className="admin-success">Identité de {saved} enregistrée.</p>}

        <div className="brand-config-grid">
          {brands.map((brand) => (
            <form className="brand-config-card" action={saveBrandAction} key={brand.subsidiary}>
              <input type="hidden" name="subsidiary" value={brand.subsidiary} />

              <div className="brand-config-head">
                <div
                  className="brand-preview-mark"
                  style={{ background: "linear-gradient(135deg, " + brand.primaryColor + ", " + brand.accentColor + ")" }}
                >
                  {brand.logoUrl ? <img src={brand.logoUrl} alt="" /> : "V"}
                </div>
                <div>
                  <h2>{brand.subsidiary}</h2>
                  <span>Profil + impression</span>
                </div>
              </div>

              <div className="brand-color-grid">
                <label>
                  <span>Couleur principale</span>
                  <div className="color-field">
                    <input type="color" name="primaryColor" defaultValue={brand.primaryColor} />
                    <code>{brand.primaryColor}</code>
                  </div>
                </label>
                <label>
                  <span>Couleur accent</span>
                  <div className="color-field">
                    <input type="color" name="accentColor" defaultValue={brand.accentColor} />
                    <code>{brand.accentColor}</code>
                  </div>
                </label>
              </div>

              <label>
                <span>Logo existant — URL</span>
                <input name="logoUrl" type="text" defaultValue={brand.logoUrl ?? ""} placeholder="/uploads/... ou https://..." />
              </label>
              <label>
                <span>Ou importer un nouveau logo</span>
                <input name="logoFile" type="file" accept="image/jpeg,image/png,image/webp" />
              </label>

              <fieldset className="brand-social-fields">
                <legend>Suivez-nous · pages de l’entreprise</legend>
                <label>
                  <span>Facebook de l’entreprise</span>
                  <input name="companyFacebook" type="url" defaultValue={brand.socialLinks?.find((link) => link.label === "Facebook")?.url ?? ""} placeholder="https://www.facebook.com/..." />
                </label>
                <label>
                  <span>LinkedIn de l’entreprise</span>
                  <input name="companyLinkedin" type="url" defaultValue={brand.socialLinks?.find((link) => link.label === "LinkedIn")?.url ?? ""} placeholder="https://www.linkedin.com/company/..." />
                </label>
                <label>
                  <span>Instagram de l’entreprise</span>
                  <input name="companyInstagram" type="url" defaultValue={brand.socialLinks?.find((link) => link.label === "Instagram")?.url ?? ""} placeholder="https://www.instagram.com/..." />
                </label>
                <p className="field-hint">Affichés dans « Suivez-nous ». Effacez un lien pour le masquer. Le LinkedIn personnel se renseigne sur la fiche du collaborateur.</p>
              </fieldset>

              <button type="submit">Enregistrer la filiale</button>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
