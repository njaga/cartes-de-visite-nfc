import QRCode from "qrcode";
import { getAdminUser } from "@/lib/admin-auth";
import { getBrandConfig, getCardById } from "@/lib/db";

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
          '" width="' + Math.ceil(cell * 100) / 100 + '" height="' + Math.ceil(cell * 100) / 100 + '" />'
        );
      }
    }
  }

  return parts.join("");
}

function logoMarkup(logoUrl: string | undefined, origin: string) {
  if (!logoUrl) {
    return '<text x="62" y="86" font-family="Arial,sans-serif" font-size="30" font-weight="800" letter-spacing="3">VIGILUS</text>';
  }

  const href = logoUrl.startsWith("/") ? origin + logoUrl : logoUrl;
  return '<image href="' + xml(href) + '" x="62" y="46" width="190" height="62" preserveAspectRatio="xMinYMid meet" />';
}

function frontSvg(args: {
  fullName: string;
  jobTitle: string;
  subsidiary: string;
  mobile?: string;
  email: string;
  website: string;
  photoUrl?: string;
  primary: string;
  accent: string;
  logoUrl?: string;
  origin: string;
}) {
  const photoHref = args.photoUrl
    ? args.photoUrl.startsWith("/") ? args.origin + args.photoUrl : args.photoUrl
    : "";

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="85.6mm" height="54mm" viewBox="0 0 856 540">',
    '<defs><clipPath id="photoClip"><circle cx="705" cy="205" r="88"/></clipPath></defs>',
    '<rect width="856" height="540" rx="24" fill="#ffffff"/>',
    '<rect x="0" y="0" width="12" height="540" fill="' + xml(args.primary) + '"/>',
    '<rect x="12" y="0" width="5" height="540" fill="' + xml(args.accent) + '"/>',
    logoMarkup(args.logoUrl, args.origin),
    '<text x="62" y="177" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="' + xml(args.primary) + '" letter-spacing="1.4">' + xml(args.subsidiary.toUpperCase()) + '</text>',
    '<text x="62" y="237" font-family="Arial,sans-serif" font-size="39" font-weight="800" fill="#12212f">' + xml(truncate(args.fullName, 27)) + '</text>',
    '<text x="62" y="275" font-family="Arial,sans-serif" font-size="19" font-weight="600" fill="#667585">' + xml(truncate(args.jobTitle, 43)) + '</text>',
    args.photoUrl
      ? '<circle cx="705" cy="205" r="94" fill="#f1f6f9"/><image href="' + xml(photoHref) + '" x="617" y="117" width="176" height="176" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/>'
      : '<circle cx="705" cy="205" r="88" fill="' + xml(args.primary) + '" opacity=".10"/><text x="705" y="220" text-anchor="middle" font-family="Arial,sans-serif" font-size="50" font-weight="800" fill="' + xml(args.primary) + '">' + xml(args.fullName.split(" ").map((part) => part[0] || "").slice(0,2).join("")) + '</text>',
    '<line x1="62" y1="343" x2="794" y2="343" stroke="#e5edf2"/>',
    args.mobile ? '<text x="62" y="391" font-family="Arial,sans-serif" font-size="16" fill="#536574">T. ' + xml(args.mobile) + '</text>' : '',
    '<text x="62" y="427" font-family="Arial,sans-serif" font-size="16" fill="#536574">' + xml(args.email) + '</text>',
    '<text x="62" y="463" font-family="Arial,sans-serif" font-size="16" fill="#536574">' + xml(args.website.replace(/^https?:\/\//, "")) + '</text>',
    '<rect x="674" y="476" width="42" height="5" rx="2.5" fill="' + xml(args.accent) + '"/>',
    '<rect x="716" y="476" width="42" height="5" rx="2.5" fill="#dfe7ec"/>',
    '<rect x="758" y="476" width="42" height="5" rx="2.5" fill="' + xml(args.primary) + '"/>',
    '</svg>'
  ].join("");
}

function backSvg(args: {
  fullName: string;
  tokenUrl: string;
  primary: string;
  accent: string;
  logoUrl?: string;
  origin: string;
}) {
  const qr = qrRects(args.tokenUrl + "?src=qr", 516, 128, 230);

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="85.6mm" height="54mm" viewBox="0 0 856 540">',
    '<rect width="856" height="540" rx="24" fill="#ffffff"/>',
    '<circle cx="145" cy="188" r="62" fill="' + xml(args.primary) + '" opacity=".09"/>',
    '<path d="M125 188a20 20 0 0 1 40 0M110 188a35 35 0 0 1 70 0M95 188a50 50 0 0 1 100 0" fill="none" stroke="' + xml(args.primary) + '" stroke-width="9" stroke-linecap="round"/>',
    '<text x="62" y="302" font-family="Arial,sans-serif" font-size="30" font-weight="800" fill="#12212f">Approchez votre téléphone</text>',
    '<text x="62" y="342" font-family="Arial,sans-serif" font-size="18" fill="#667585">ou scannez le QR code pour enregistrer le contact.</text>',
    '<text x="62" y="405" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="' + xml(args.primary) + '">' + xml(truncate(args.fullName, 36)) + '</text>',
    '<rect x="486" y="98" width="290" height="290" rx="26" fill="#f7fafc"/>',
    '<g fill="#12212f">' + qr + '</g>',
    '<text x="631" y="423" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#7d8c98">NFC + QR</text>',
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
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || requestUrl.origin;
  const nfcUrl = origin + "/n/" + card.nfcToken;

  const svg = side === "front"
    ? frontSvg({
        fullName: card.firstName + " " + card.lastName,
        jobTitle: card.jobTitle,
        subsidiary: card.subsidiary,
        mobile: card.mobile,
        email: card.email,
        website: card.website,
        photoUrl: card.photoUrl,
        primary: brand.primaryColor,
        accent: brand.accentColor,
        logoUrl: brand.logoUrl,
        origin
      })
    : backSvg({
        fullName: card.firstName + " " + card.lastName,
        tokenUrl: nfcUrl,
        primary: brand.primaryColor,
        accent: brand.accentColor,
        logoUrl: brand.logoUrl,
        origin
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
