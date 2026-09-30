import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { getAdminUser } from "@/lib/admin-auth";
import { getBrandConfig, getCardById } from "@/lib/db";
import { contentTypeForFile, uploadsDirectory } from "@/lib/uploads";
import { getPublicSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function xml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(value: string, max: number) {
  return value.length <= max ? value : value.slice(0, max - 1) + "…";
}

async function embeddedAsset(url: string | undefined, origin: string) {
  if (!url) return undefined;

  try {
    if (url.startsWith("/branding/")) {
      const filename = path.basename(url);
      const bytes = await readFile(path.join(process.cwd(), "public", "branding", filename));
      const type = contentTypeForFile(filename) || "image/png";
      return "data:" + type + ";base64," + bytes.toString("base64");
    }

    if (url.startsWith("/uploads/")) {
      const filename = path.basename(url);
      const bytes = await readFile(path.join(uploadsDirectory(), filename));
      const type = contentTypeForFile(filename);
      if (!type) return origin + url;
      return "data:" + type + ";base64," + bytes.toString("base64");
    }
  } catch {
    return origin + url;
  }

  return url.startsWith("/") ? origin + url : url;
}

function qrRects(value: string, x: number, y: number, sizePx: number) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
  const count = qr.modules.size;
  const cell = sizePx / count;
  const parts: string[] = [];

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (qr.modules.data[row * count + col]) {
        parts.push(
          '<rect x="' + (x + col * cell).toFixed(2) + '" y="' + (y + row * cell).toFixed(2) +
          '" width="' + (cell + 0.08).toFixed(2) + '" height="' + (cell + 0.08).toFixed(2) + '" />'
        );
      }
    }
  }

  return parts.join("");
}

function frontSvg(args: {
  fullName: string;
  jobTitle: string;
  subsidiary: string;
  mobile?: string;
  email: string;
  website: string;
  photoHref?: string;
  primary: string;
  accent: string;
  logoHref: string;
}) {
  const initials = args.fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0] || "")
    .slice(0, 2)
    .join("");

  const photo = args.photoHref
    ? [
        '<circle cx="704" cy="214" r="101" fill="#f4f8fa"/>',
        '<circle cx="704" cy="214" r="94" fill="#ffffff"/>',
        '<clipPath id="photoClip"><circle cx="704" cy="214" r="88"/></clipPath>',
        '<image href="' + xml(args.photoHref) + '" x="616" y="126" width="176" height="176" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/>'
      ].join("")
    : [
        '<circle cx="704" cy="214" r="94" fill="' + xml(args.primary) + '" opacity=".08"/>',
        '<text x="704" y="231" text-anchor="middle" font-family="Arial,sans-serif" font-size="52" font-weight="800" fill="' + xml(args.primary) + '">' + xml(initials) + '</text>'
      ].join("");

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="85.6mm" height="54mm" viewBox="0 0 856 540">',
    '<rect width="856" height="540" fill="#ffffff"/>',
    '<path d="M650 0H856V540H785C745 458 720 396 697 328C673 257 666 176 650 0Z" fill="' + xml(args.primary) + '" opacity=".055"/>',
    '<rect x="0" y="0" width="10" height="540" fill="' + xml(args.primary) + '"/>',
    '<rect x="10" y="0" width="4" height="540" fill="' + xml(args.accent) + '"/>',
    '<image href="' + xml(args.logoHref) + '" x="54" y="42" width="128" height="108" preserveAspectRatio="xMinYMid meet"/>',
    '<text x="54" y="181" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="' + xml(args.primary) + '" letter-spacing="1.5">' + xml(args.subsidiary.toUpperCase()) + '</text>',
    '<text x="54" y="250" font-family="Arial,sans-serif" font-size="41" font-weight="800" fill="#102230">' + xml(truncate(args.fullName, 27)) + '</text>',
    '<text x="54" y="290" font-family="Arial,sans-serif" font-size="18" font-weight="600" fill="#657786">' + xml(truncate(args.jobTitle, 44)) + '</text>',
    photo,
    '<line x1="54" y1="351" x2="802" y2="351" stroke="#e5edf2"/>',
    args.mobile ? '<text x="54" y="398" font-family="Arial,sans-serif" font-size="15" fill="#4c6170">T. ' + xml(args.mobile) + '</text>' : '',
    '<text x="54" y="433" font-family="Arial,sans-serif" font-size="15" fill="#4c6170">' + xml(args.email) + '</text>',
    '<text x="54" y="468" font-family="Arial,sans-serif" font-size="15" fill="#4c6170">' + xml(args.website.replace(/^https?:\/\//, "")) + '</text>',
    '<rect x="676" y="485" width="40" height="5" rx="2.5" fill="' + xml(args.accent) + '"/>',
    '<rect x="716" y="485" width="40" height="5" rx="2.5" fill="#dce5eb"/>',
    '<rect x="756" y="485" width="40" height="5" rx="2.5" fill="' + xml(args.primary) + '"/>',
    '</svg>'
  ].join("");
}

function backSvg(args: {
  fullName: string;
  subsidiary: string;
  tokenUrl: string;
  primary: string;
  accent: string;
  logoHref: string;
}) {
  const qr = qrRects(args.tokenUrl + "?src=qr", 532, 135, 214);

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="85.6mm" height="54mm" viewBox="0 0 856 540">',
    '<rect width="856" height="540" fill="#ffffff"/>',
    '<rect x="0" y="0" width="856" height="10" fill="' + xml(args.primary) + '"/>',
    '<image href="' + xml(args.logoHref) + '" x="54" y="48" width="112" height="94" preserveAspectRatio="xMinYMid meet"/>',
    '<circle cx="129" cy="224" r="58" fill="' + xml(args.primary) + '" opacity=".08"/>',
    '<path d="M108 224a21 21 0 0 1 42 0M92 224a37 37 0 0 1 74 0M76 224a53 53 0 0 1 106 0" fill="none" stroke="' + xml(args.primary) + '" stroke-width="8" stroke-linecap="round"/>',
    '<text x="54" y="332" font-family="Arial,sans-serif" font-size="29" font-weight="800" fill="#102230">Approchez votre téléphone</text>',
    '<text x="54" y="373" font-family="Arial,sans-serif" font-size="17" fill="#657786">ou scannez le QR code pour ouvrir la carte digitale.</text>',
    '<text x="54" y="426" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="' + xml(args.primary) + '">' + xml(truncate(args.fullName, 36)) + '</text>',
    '<text x="54" y="452" font-family="Arial,sans-serif" font-size="13" fill="#7d8c98">' + xml(args.subsidiary) + '</text>',
    '<rect x="500" y="103" width="278" height="278" rx="24" fill="#f7fafc" stroke="#e5edf2"/>',
    '<g fill="#102230">' + qr + '</g>',
    '<text x="639" y="414" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#7d8c98">NFC + QR</text>',
    '<rect x="0" y="506" width="285.3" height="34" fill="' + xml(args.accent) + '"/>',
    '<rect x="285.3" y="506" width="285.3" height="34" fill="#ffffff"/>',
    '<rect x="570.6" y="506" width="285.4" height="34" fill="' + xml(args.primary) + '"/>',
    '</svg>'
  ].join("");
}

export async function GET(request: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) return new Response("Non autorisé", { status: 401 });

  const { id } = await context.params;
  const card = getCardById(Number(id));
  if (!card) return new Response("Carte introuvable", { status: 404 });

  const brand = getBrandConfig(card.subsidiary);
  const requestUrl = new URL(request.url);
  const side = requestUrl.searchParams.get("side") === "back" ? "back" : "front";
  const origin = getPublicSiteUrl();
  const nfcUrl = origin + "/n/" + card.nfcToken;

  const logoHref = await embeddedAsset(brand.logoUrl || "/branding/vigilus-groupe-sa.png", origin);
  const photoHref = await embeddedAsset(card.photoUrl, origin);

  if (!logoHref) {
    return new Response("Logo introuvable", { status: 500 });
  }

  const svg = side === "front"
    ? frontSvg({
        fullName: card.firstName + " " + card.lastName,
        jobTitle: card.jobTitle,
        subsidiary: card.subsidiary,
        mobile: card.mobile,
        email: card.email,
        website: card.website,
        photoHref,
        primary: brand.primaryColor,
        accent: brand.accentColor,
        logoHref
      })
    : backSvg({
        fullName: card.firstName + " " + card.lastName,
        subsidiary: card.subsidiary,
        tokenUrl: nfcUrl,
        primary: brand.primaryColor,
        accent: brand.accentColor,
        logoHref
      });

  const headers = new Headers({
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "private, no-store"
  });

  if (requestUrl.searchParams.get("download") === "1") {
    headers.set(
      "Content-Disposition",
      'attachment; filename="' + card.slug + "-" + side + '.svg"'
    );
  }

  return new Response(svg, { headers });
}
