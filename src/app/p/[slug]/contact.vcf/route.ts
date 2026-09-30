import path from "node:path";
import { getProfileBySlug } from "@/lib/db";
import { createVCard, type VCardPhoto } from "@/lib/vcard";
import { getPublicSiteUrl } from "@/lib/site-url";
import { getUploadedImage } from "@/lib/uploads";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

async function embeddedPhoto(photoUrl?: string): Promise<VCardPhoto | undefined> {
  if (!photoUrl?.startsWith("/uploads/")) return undefined;

  const filename = path.basename(photoUrl);
  const asset = await getUploadedImage(filename);
  if (!asset) return undefined;

  if (!["image/jpeg", "image/png"].includes(asset.contentType)) {
    return undefined;
  }

  // Keep contact imports lightweight. Large photos fall back to their public URL.
  if (asset.bytes.length > 1024 * 1024) {
    return undefined;
  }

  return {
    contentType: asset.contentType,
    base64: asset.bytes.toString("base64")
  };
}

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await context.params;
  const profile = await getProfileBySlug(slug);

  if (!profile) {
    return new Response("Contact introuvable", { status: 404 });
  }

  const fileName = (profile.firstName + "-" + profile.lastName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .toLowerCase();

  const baseUrl = getPublicSiteUrl();
  const photo = await embeddedPhoto(profile.photoUrl);

  return new Response(createVCard(profile, baseUrl, photo), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition":
        'inline; filename="' +
        fileName +
        '.vcf"; filename*=UTF-8\'\'' +
        encodeURIComponent(fileName + ".vcf"),
      "Cache-Control": "private, max-age=60",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
