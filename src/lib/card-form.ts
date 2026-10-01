import type { ServiceImage } from "./profiles";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export function serviceList(raw: string) {
  return raw.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean).slice(0, 8);
}

export function optionalUrl(raw: string, allowLocal = false) {
  if (!raw) return undefined;
  if (allowLocal && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const url = new URL(raw);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    // Invalid URLs are rejected before they can be saved.
  }
  throw new Error("Utilisez un lien valide commençant par https:// ou http://.");
}

export async function servicesFromForm(
  formData: FormData,
  saveImage: (file: File) => Promise<string>,
  existingImages?: ServiceImage[]
) {
  if (formData.get("servicesEditor") !== "1") {
    return { services: serviceList(value(formData, "services")), serviceImages: existingImages };
  }

  const services: string[] = [];
  const serviceImages: ServiceImage[] = [];
  const keys = [...new Set(formData.getAll("serviceKey").map(String))].slice(0, 8);
  for (const key of keys) {
    if (!/^\d+$/.test(key)) continue;
    const name = value(formData, `serviceName-${key}`).slice(0, 120);
    if (!name || services.includes(name)) continue;
    const file = formData.get(`serviceImageFile-${key}`);
    const imageUrl = file instanceof File && file.size > 0
      ? await saveImage(file)
      : optionalUrl(value(formData, `serviceImageUrl-${key}`), true);
    services.push(name);
    if (imageUrl) serviceImages.push({ name, imageUrl });
  }
  return { services, serviceImages };
}
