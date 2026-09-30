import { getProfileBySlug } from "@/lib/db";
import { createVCard } from "@/lib/vcard";
import { getPublicSiteUrl } from "@/lib/site-url";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const profile = getProfileBySlug(slug);

  if (!profile) {
    return new Response("Contact introuvable", { status: 404 });
  }

  const fileName = (profile.firstName + "-" + profile.lastName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .toLowerCase();

  const baseUrl = getPublicSiteUrl();

  return new Response(createVCard(profile, baseUrl), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'inline; filename="' + fileName + '.vcf"',
      "Cache-Control": "public, max-age=300, s-maxage=300"
    }
  });
}
