"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import {
  adminIsConfigured,
  clearAdminSession,
  createAdminSession,
  requireAdmin,
  verifyAdminCredentials
} from "@/lib/admin-auth";
import {
  getCardById,
  getProfileByEmail,
  createLead,
  getProfileBySlug,
  saveBrandConfig,
  saveCard,
  saveCardLandingData,
  setCardActive,
  setCardProvisioningStatus,
  updateLeadStatus
} from "@/lib/db";
import { saveUploadedImage } from "@/lib/uploads";
import type { DigitalCard, NfcProvisioningStatus, SocialLink } from "@/lib/profiles";
import type { CardLandingData, CardResource } from "@/lib/landing";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function serviceList(raw: string) {
  return raw
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function socialLinks(formData: FormData): SocialLink[] {
  const fields = [
    ["LinkedIn", "linkedin"],
    ["Facebook", "facebook"],
    ["Instagram", "instagram"],
    ["X", "x"]
  ] as const;

  return fields
    .map(([label, field]) => ({ label, url: value(formData, field) }))
    .filter((link) => Boolean(link.url));
}

function cell(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const raw = row[key];
    if (raw !== undefined && raw !== null) return String(raw).trim();
  }
  return "";
}

async function uploadedOrValue(
  formData: FormData,
  fileKey: string,
  valueKey: string
) {
  const file = formData.get(fileKey);
  if (file instanceof File && file.size > 0) {
    return saveUploadedImage(file);
  }
  return value(formData, valueKey) || undefined;
}

function resourceType(raw: string): CardResource["resourceType"] {
  if (raw === "video" || raw === "catalogue" || raw === "link") return raw;
  return "pdf";
}

function rowSocialLinks(row: Record<string, unknown>): SocialLink[] {
  return [
    { label: "LinkedIn", url: cell(row, "LinkedIn", "linkedin") },
    { label: "Facebook", url: cell(row, "Facebook", "facebook") },
    { label: "Instagram", url: cell(row, "Instagram", "instagram") },
    { label: "X", url: cell(row, "X", "Twitter", "x") }
  ].filter((link) => Boolean(link.url));
}

export async function loginAdmin(formData: FormData) {
  if (!adminIsConfigured()) redirect("/admin/login?error=setup");

  const email = value(formData, "email");
  const password = value(formData, "password");

  if (!verifyAdminCredentials(email, password)) {
    redirect("/admin/login?error=credentials");
  }

  await createAdminSession(email);
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveCardAction(formData: FormData) {
  await requireAdmin();

  const idRaw = value(formData, "id");
  const id = idRaw ? Number(idRaw) : undefined;
  const existing = id && Number.isFinite(id) ? await getCardById(id) : undefined;

  const firstName = value(formData, "firstName");
  const lastName = value(formData, "lastName");
  let slug = value(formData, "slug") || slugify(firstName + "-" + lastName) || "collaborateur";

  const sameSlug = await getProfileBySlug(slug, { includeInactive: true });
  if (sameSlug?.id && sameSlug.id !== existing?.id) {
    slug = slug + "-" + randomUUID().slice(0, 6);
  }

  let photoUrl = value(formData, "photoUrl") || existing?.photoUrl;
  const photoFile = formData.get("photoFile");
  if (photoFile instanceof File && photoFile.size > 0) {
    photoUrl = await saveUploadedImage(photoFile);
  }

  const card: DigitalCard = {
    id: existing?.id,
    slug,
    nfcToken: existing?.nfcToken || "vig-" + randomUUID().replace(/-/g, "").slice(0, 14),
    nfcMode: value(formData, "nfcMode") === "vcard" ? "vcard" : "profile",
    nfcStatus: existing?.nfcStatus ?? "new",
    programmedAt: existing?.programmedAt,
    testedAt: existing?.testedAt,
    active: formData.get("active") === "on",
    firstName,
    lastName,
    jobTitle: value(formData, "jobTitle"),
    subsidiary: value(formData, "subsidiary"),
    company: value(formData, "company") || "VIGILUS Group",
    mobile: value(formData, "mobile") || undefined,
    whatsapp: value(formData, "whatsapp") || undefined,
    whatsappMessage: value(formData, "whatsappMessage") || undefined,
    phone: value(formData, "phone") || undefined,
    email: value(formData, "email"),
    website: value(formData, "website"),
    address: value(formData, "address"),
    city: value(formData, "city"),
    country: value(formData, "country"),
    presentation: value(formData, "presentation") || undefined,
    photoUrl,
    socialLinks: socialLinks(formData),
    services: serviceList(value(formData, "services")),
    commercialCtaLabel: value(formData, "commercialCtaLabel") || undefined,
    commercialCtaUrl: value(formData, "commercialCtaUrl") || undefined,
    offerTitle: value(formData, "offerTitle") || undefined,
    offerText: value(formData, "offerText") || undefined,
    offerUrl: value(formData, "offerUrl") || undefined,
    offerStartDate: value(formData, "offerStartDate") || undefined,
    offerEndDate: value(formData, "offerEndDate") || undefined,
    brochureLabel: value(formData, "brochureLabel") || undefined,
    brochureUrl: value(formData, "brochureUrl") || undefined
  };

  const savedId = await saveCard(card);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/p/" + card.slug);
  redirect("/admin/cartes/" + savedId + "?saved=1");
}

export async function toggleCardAction(formData: FormData) {
  await requireAdmin();

  const id = Number(value(formData, "id"));
  const active = value(formData, "active") === "1";

  if (Number.isFinite(id)) await setCardActive(id, active);

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateProvisioningAction(formData: FormData) {
  await requireAdmin();

  const id = Number(value(formData, "id"));
  const rawStatus = value(formData, "status");
  const status: NfcProvisioningStatus =
    rawStatus === "tested" ? "tested" : rawStatus === "programmed" ? "programmed" : "new";

  if (Number.isFinite(id)) {
    await setCardProvisioningStatus(id, status);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/cartes/" + id);
  redirect("/admin/cartes/" + id + "/programmer?updated=1");
}

export async function importCardsAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/import?error=file");
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    redirect("/admin/import?error=format");
  }

  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: "",
    raw: false
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const email = cell(row, "Email", "E-mail", "email").toLowerCase();
    const firstName = cell(row, "Prénom", "Prenom", "First name");
    const lastName = cell(row, "Nom", "Last name");
    const jobTitle = cell(row, "Poste", "Fonction", "Job title");
    const subsidiary = cell(row, "Filiale", "Subsidiary") || "Vigilus Sénégal";

    if (!email || !firstName || !lastName || !jobTitle) {
      skipped += 1;
      continue;
    }

    const existing = await getProfileByEmail(email);
    const importedServices = serviceList(cell(row, "Services", "Expertises"));
    let slug = existing?.slug || slugify(firstName + "-" + lastName) || "collaborateur";
    if (!existing) {
      const slugOwner = await getProfileBySlug(slug, { includeInactive: true });
      if (slugOwner) slug = slug + "-" + randomUUID().slice(0, 6);
    }

    const card: DigitalCard = {
      id: existing?.id,
      slug,
      nfcToken: existing?.nfcToken || "vig-" + randomUUID().replace(/-/g, "").slice(0, 14),
      nfcMode: existing?.nfcMode ?? "profile",
      nfcStatus: existing?.nfcStatus ?? "new",
      programmedAt: existing?.programmedAt,
      testedAt: existing?.testedAt,
      active: cell(row, "Actif", "Active").toLowerCase() !== "non",
      firstName,
      lastName,
      jobTitle,
      subsidiary,
      company: cell(row, "Entreprise", "Company") || "VIGILUS Group",
      mobile: cell(row, "Téléphone portable", "Telephone portable", "Mobile") || existing?.mobile,
      whatsapp: cell(row, "WhatsApp", "Whatsapp") || existing?.whatsapp,
      whatsappMessage: cell(row, "Message WhatsApp", "WhatsApp Message") || existing?.whatsappMessage,
      phone: cell(row, "Téléphone fixe", "Telephone fixe", "Fixe") || existing?.phone,
      email,
      website: cell(row, "Site web", "Website") || existing?.website || "https://www.groupevigilus.com",
      address: cell(row, "Adresse", "Address") || existing?.address || "",
      city: cell(row, "Ville", "City") || existing?.city || "Dakar",
      country: cell(row, "Pays", "Country") || existing?.country || "Sénégal",
      presentation: cell(row, "Présentation", "Presentation") || existing?.presentation,
      photoUrl: cell(row, "Photo URL", "Photo") || existing?.photoUrl,
      socialLinks: rowSocialLinks(row).length ? rowSocialLinks(row) : existing?.socialLinks,
      services: importedServices.length ? importedServices : existing?.services,
      commercialCtaLabel: cell(row, "CTA commercial", "CTA label") || existing?.commercialCtaLabel,
      commercialCtaUrl: cell(row, "Lien CTA", "CTA URL") || existing?.commercialCtaUrl,
      offerTitle: cell(row, "Titre offre", "Offer title") || existing?.offerTitle,
      offerText: cell(row, "Texte offre", "Offer text") || existing?.offerText,
      offerUrl: cell(row, "Lien offre", "Offer URL") || existing?.offerUrl,
      offerStartDate: cell(row, "Début offre", "Offer start") || existing?.offerStartDate,
      offerEndDate: cell(row, "Fin offre", "Offer end") || existing?.offerEndDate,
      brochureLabel: cell(row, "Libellé brochure", "Brochure label") || existing?.brochureLabel,
      brochureUrl: cell(row, "Lien brochure", "Brochure URL") || existing?.brochureUrl
    };

    await saveCard(card);
    if (existing) updated += 1;
    else created += 1;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin/import?created=" + created + "&updated=" + updated + "&skipped=" + skipped);
}

export async function saveBrandAction(formData: FormData) {
  await requireAdmin();

  const subsidiary = value(formData, "subsidiary");
  const primaryColor = value(formData, "primaryColor") || "#13a3e3";
  const accentColor = value(formData, "accentColor") || "#c30c29";
  let logoUrl = value(formData, "logoUrl") || undefined;

  const logoFile = formData.get("logoFile");
  if (logoFile instanceof File && logoFile.size > 0) {
    logoUrl = await saveUploadedImage(logoFile);
  }

  await saveBrandConfig({ subsidiary, primaryColor, accentColor, logoUrl });

  revalidatePath("/admin/filiales");
  revalidatePath("/admin");
  redirect("/admin/filiales?saved=" + encodeURIComponent(subsidiary));
}


export async function saveLandingAction(formData: FormData) {
  await requireAdmin();

  const cardId = Number(value(formData, "cardId"));
  if (!Number.isFinite(cardId)) redirect("/admin");

  const card = await getCardById(cardId);
  if (!card) redirect("/admin");

  const heroImageUrl = await uploadedOrValue(formData, "heroImageFile", "heroImageUrl");

  const services = [];
  for (let index = 0; index < 4; index += 1) {
    const title = value(formData, "serviceTitle" + index);
    if (!title) continue;
    services.push({
      title,
      description: value(formData, "serviceDescription" + index) || undefined,
      url: value(formData, "serviceUrl" + index) || undefined,
      imageUrl: await uploadedOrValue(
        formData,
        "serviceImageFile" + index,
        "serviceImageUrl" + index
      )
    });
  }

  const resources = [];
  for (let index = 0; index < 3; index += 1) {
    const title = value(formData, "resourceTitle" + index);
    const url = value(formData, "resourceUrl" + index);
    if (!title || !url) continue;
    resources.push({
      title,
      description: value(formData, "resourceDescription" + index) || undefined,
      resourceType: resourceType(value(formData, "resourceType" + index)),
      url,
      thumbnailUrl: await uploadedOrValue(
        formData,
        "resourceThumbnailFile" + index,
        "resourceThumbnailUrl" + index
      )
    });
  }

  const gallery = [];
  for (let index = 0; index < 5; index += 1) {
    const imageUrl = await uploadedOrValue(
      formData,
      "galleryFile" + index,
      "galleryImageUrl" + index
    );
    if (!imageUrl) continue;
    gallery.push({
      imageUrl,
      caption: value(formData, "galleryCaption" + index) || undefined,
      altText: value(formData, "galleryAlt" + index) || undefined
    });
  }

  const highlights = [];
  for (let index = 0; index < 3; index += 1) {
    const label = value(formData, "highlightLabel" + index);
    if (!label) continue;
    highlights.push({
      value: value(formData, "highlightValue" + index) || undefined,
      label
    });
  }

  const campaignTitle = value(formData, "campaignTitle");
  const campaignImageUrl = await uploadedOrValue(
    formData,
    "campaignImageFile",
    "campaignImageUrl"
  );

  const landing: CardLandingData = {
    heroTitle: value(formData, "heroTitle") || undefined,
    heroSubtitle: value(formData, "heroSubtitle") || undefined,
    heroImageUrl,
    heroBadge: value(formData, "heroBadge") || undefined,
    aboutText: value(formData, "aboutText") || undefined,
    languages: serviceList(value(formData, "languages")),
    primaryCtaLabel: value(formData, "primaryCtaLabel") || undefined,
    primaryCtaUrl: value(formData, "primaryCtaUrl") || undefined,
    bookingUrl: value(formData, "bookingUrl") || undefined,
    leadFormEnabled: formData.get("leadFormEnabled") === "on",
    services,
    resources,
    gallery,
    highlights,
    campaign: campaignTitle
      ? {
          title: campaignTitle,
          description: value(formData, "campaignDescription") || undefined,
          imageUrl: campaignImageUrl,
          ctaLabel: value(formData, "campaignCtaLabel") || undefined,
          ctaUrl: value(formData, "campaignCtaUrl") || undefined,
          startsAt: value(formData, "campaignStartsAt") || undefined,
          endsAt: value(formData, "campaignEndsAt") || undefined,
          active: formData.get("campaignActive") === "on"
        }
      : undefined
  };

  await saveCardLandingData(cardId, landing);

  revalidatePath("/admin/cartes/" + cardId);
  revalidatePath("/p/" + card.slug);
  redirect("/admin/cartes/" + cardId + "?landingSaved=1#landing");
}

export async function submitLeadAction(formData: FormData) {
  const slug = value(formData, "slug");
  const cardId = Number(value(formData, "cardId"));
  const honeypot = value(formData, "website");

  if (honeypot) redirect("/p/" + slug + "?lead=1#lead-form");

  const name = value(formData, "name");
  const company = value(formData, "company");
  const phone = value(formData, "phone");
  const email = value(formData, "email");
  const message = value(formData, "message");
  const rawSource = value(formData, "source");
  const source = rawSource === "nfc" || rawSource === "qr" ? rawSource : "web";

  if (!Number.isFinite(cardId) || !slug || !name || (!phone && !email)) {
    redirect("/p/" + slug + "?leadError=1&src=" + source + "#lead-form");
  }

  await createLead({
    cardId,
    name,
    company: company || undefined,
    phone: phone || undefined,
    email: email || undefined,
    message: message || undefined,
    source
  });

  redirect("/p/" + slug + "?lead=1&src=" + source + "#lead-form");
}

export async function updateLeadStatusAction(formData: FormData) {
  await requireAdmin();

  const leadId = Number(value(formData, "leadId"));
  const cardId = Number(value(formData, "cardId"));
  const raw = value(formData, "status");
  const status =
    raw === "contacted" || raw === "qualified" || raw === "converted"
      ? raw
      : "new";

  if (Number.isFinite(leadId)) {
    await updateLeadStatus(leadId, status);
  }

  revalidatePath("/admin/cartes/" + cardId);
  redirect("/admin/cartes/" + cardId + "#leads");
}
