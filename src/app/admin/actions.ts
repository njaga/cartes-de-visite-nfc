"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  adminIsConfigured,
  clearAdminSession,
  createAdminSession,
  requireAdmin,
  verifyAdminCredentials
} from "@/lib/admin-auth";
import {
  getCardById,
  getProfileBySlug,
  saveCard,
  setCardActive,
  setCardProvisioningStatus
} from "@/lib/db";
import type { DigitalCard, NfcProvisioningStatus, SocialLink } from "@/lib/profiles";

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
  const existing = id && Number.isFinite(id) ? getCardById(id) : undefined;

  const firstName = value(formData, "firstName");
  const lastName = value(formData, "lastName");
  let slug = value(formData, "slug") || slugify(firstName + "-" + lastName) || "collaborateur";

  const sameSlug = getProfileBySlug(slug, { includeInactive: true });
  if (sameSlug?.id && sameSlug.id !== existing?.id) {
    slug = slug + "-" + randomUUID().slice(0, 6);
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
    phone: value(formData, "phone") || undefined,
    email: value(formData, "email"),
    website: value(formData, "website"),
    address: value(formData, "address"),
    city: value(formData, "city"),
    country: value(formData, "country"),
    presentation: value(formData, "presentation") || undefined,
    photoUrl: value(formData, "photoUrl") || undefined,
    socialLinks: socialLinks(formData)
  };

  const savedId = saveCard(card);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/p/" + card.slug);
  redirect("/admin/cartes/" + savedId + "?saved=1");
}

export async function toggleCardAction(formData: FormData) {
  await requireAdmin();

  const id = Number(value(formData, "id"));
  const active = value(formData, "active") === "1";

  if (Number.isFinite(id)) setCardActive(id, active);

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
    setCardProvisioningStatus(id, status);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/cartes/" + id);
  redirect("/admin/cartes/" + id + "/programmer?updated=1");
}
