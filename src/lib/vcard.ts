import type { DigitalCard } from "@/lib/profiles";

export type VCardPhoto = {
  contentType: string;
  base64: string;
};

function escapeVCard(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function safeType(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "") || "link";
}

function whatsappUrl(value: string, message?: string) {
  const base = "https://wa.me/" + value.replace(/\D/g, "");
  return message ? base + "?text=" + encodeURIComponent(message) : base;
}

function compactRevision(value?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return undefined;
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function foldLine(line: string) {
  const maxBytes = 73;
  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let chunk = "";
  let chunkBytes = 0;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    if (chunk && chunkBytes + charBytes > maxBytes) {
      chunks.push(chunk);
      chunk = char;
      chunkBytes = charBytes;
    } else {
      chunk += char;
      chunkBytes += charBytes;
    }
  }

  if (chunk) chunks.push(chunk);
  return chunks.join("\r\n ");
}

function labeledUrl(index: number, url: string, label: string) {
  return [
    "item" + index + ".URL:" + escapeVCard(url),
    "item" + index + ".X-ABLabel:" + escapeVCard(label)
  ];
}

function photoLine(photo?: VCardPhoto, fallbackUrl?: string) {
  if (photo?.base64) {
    const type =
      photo.contentType === "image/png"
        ? "PNG"
        : photo.contentType === "image/jpeg"
          ? "JPEG"
          : undefined;

    if (type) {
      return "PHOTO;ENCODING=b;TYPE=" + type + ":" + photo.base64;
    }
  }

  return fallbackUrl ? "PHOTO;VALUE=URI:" + escapeVCard(fallbackUrl) : null;
}

export function createVCard(
  profile: DigitalCard,
  baseUrl?: string,
  photo?: VCardPhoto
) {
  const fullName = profile.firstName + " " + profile.lastName;
  const normalizedBase = baseUrl?.replace(/\/$/, "");
  const profileUrl = normalizedBase
    ? normalizedBase + "/p/" + encodeURIComponent(profile.slug)
    : undefined;
  const fallbackPhotoUrl =
    profile.photoUrl && profile.photoUrl.startsWith("/") && normalizedBase
      ? normalizedBase + profile.photoUrl
      : profile.photoUrl;

  const noteSections = [
    profile.presentation,
    profile.services?.length
      ? "Expertises : " + profile.services.join(", ")
      : null,
    profile.subsidiary ? "Filiale : " + profile.subsidiary : null,
    profile.whatsapp ? "WhatsApp : " + profile.whatsapp : null,
    profile.commercialCtaLabel && profile.commercialCtaUrl
      ? profile.commercialCtaLabel + " : " + profile.commercialCtaUrl
      : null,
    profile.brochureUrl
      ? (profile.brochureLabel || "Brochure") + " : " + profile.brochureUrl
      : null,
    profileUrl ? "Profil digital Vigilus : " + profileUrl : null
  ].filter((value): value is string => Boolean(value));

  const lines: Array<string | null> = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "PRODID:-//VIGILUS//Digital Business Card//FR",
    profileUrl ? "UID:" + escapeVCard(profileUrl) : "UID:" + escapeVCard(profile.nfcToken),
    "N;CHARSET=UTF-8:" +
      escapeVCard(profile.lastName) +
      ";" +
      escapeVCard(profile.firstName) +
      ";;;",
    "FN;CHARSET=UTF-8:" + escapeVCard(fullName),
    "ORG;CHARSET=UTF-8:" +
      escapeVCard(profile.company) +
      ";" +
      escapeVCard(profile.subsidiary),
    "TITLE;CHARSET=UTF-8:" + escapeVCard(profile.jobTitle),
    "ROLE;CHARSET=UTF-8:" + escapeVCard(profile.jobTitle),
    profile.mobile
      ? "TEL;TYPE=CELL,VOICE,PREF:" + escapeVCard(profile.mobile)
      : null,
    profile.phone
      ? "TEL;TYPE=WORK,VOICE:" + escapeVCard(profile.phone)
      : null,
    "EMAIL;TYPE=INTERNET,WORK,PREF:" + escapeVCard(profile.email),
    "ADR;TYPE=WORK;CHARSET=UTF-8:;;" +
      escapeVCard(profile.address) +
      ";" +
      escapeVCard(profile.city) +
      ";;;" +
      escapeVCard(profile.country),
    profile.website ? "URL;TYPE=WORK:" + escapeVCard(profile.website) : null,
    profileUrl ? "SOURCE:" + escapeVCard(profileUrl) : null,
    photoLine(photo, fallbackPhotoUrl),
    profile.whatsapp
      ? "IMPP;X-SERVICE-TYPE=WhatsApp:" +
        escapeVCard(whatsappUrl(profile.whatsapp, profile.whatsappMessage))
      : null,
    profile.whatsapp
      ? "X-SOCIALPROFILE;TYPE=whatsapp:" +
        escapeVCard(whatsappUrl(profile.whatsapp, profile.whatsappMessage))
      : null,
    profile.services?.length
      ? "CATEGORIES;CHARSET=UTF-8:" +
        profile.services.map(escapeVCard).join(",")
      : null,
    noteSections.length
      ? "NOTE;CHARSET=UTF-8:" + escapeVCard(noteSections.join("\n\n"))
      : null,
    "CLASS:PUBLIC",
    "REV:" + (compactRevision(profile.updatedAt) || compactRevision()),
    "X-VIGILUS-SUBSIDIARY;CHARSET=UTF-8:" + escapeVCard(profile.subsidiary),
    profile.services?.length
      ? "X-VIGILUS-SERVICES;CHARSET=UTF-8:" +
        escapeVCard(profile.services.join(" | "))
      : null
  ];

  let itemIndex = 1;

  if (profileUrl) {
    lines.push(...labeledUrl(itemIndex++, profileUrl, "Profil digital Vigilus"));
  }

  if (
    profile.commercialCtaUrl &&
    profile.commercialCtaUrl !== profile.website &&
    profile.commercialCtaUrl !== profileUrl
  ) {
    lines.push(
      ...labeledUrl(
        itemIndex++,
        profile.commercialCtaUrl,
        profile.commercialCtaLabel || "Découvrir nos solutions"
      )
    );
  }

  if (profile.brochureUrl) {
    lines.push(
      ...labeledUrl(
        itemIndex++,
        profile.brochureUrl,
        profile.brochureLabel || "Brochure"
      )
    );
  }

  for (const link of profile.socialLinks ?? []) {
    lines.push(
      "X-SOCIALPROFILE;TYPE=" +
        safeType(link.label) +
        ":" +
        escapeVCard(link.url)
    );
    lines.push(...labeledUrl(itemIndex++, link.url, link.label));
  }

  lines.push("END:VCARD");

  return lines
    .filter((line): line is string => Boolean(line))
    .map(foldLine)
    .join("\r\n") + "\r\n";
}
