import QRCode from "qrcode";
import { getProfileByNfcToken } from "@/lib/db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const profile = getProfileByNfcToken(token, { includeInactive: true });

  if (!profile) {
    return new Response("Carte introuvable", { status: 404 });
  }

  const requestUrl = new URL(request.url);
  const configuredBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const baseUrl = configuredBase || requestUrl.origin;
  const target = baseUrl + "/n/" + profile.nfcToken + "?src=qr";

  const svg = await QRCode.toString(target, {
    type: "svg",
    width: 512,
    margin: 1,
    errorCorrectionLevel: "M"
  });

  const download = requestUrl.searchParams.get("download") === "1";
  const headers = new Headers({
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "private, max-age=300"
  });

  if (download) {
    headers.set("Content-Disposition", 'attachment; filename="' + profile.slug + '-qr.svg"');
  }

  return new Response(svg, { headers });
}
