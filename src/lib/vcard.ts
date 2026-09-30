import type { DigitalCard } from "@/lib/profiles";

function escapeVCard(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function createVCard(profile: DigitalCard) {
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const noteParts = [
    profile.presentation,
    profile.socialLinks?.map((link) => `${link.label}: ${link.url}`).join(" | ")
  ].filter(Boolean);

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard(profile.lastName)};${escapeVCard(profile.firstName)};;;`,
    `FN:${escapeVCard(fullName)}`,
    `ORG:${escapeVCard(profile.company)};${escapeVCard(profile.subsidiary)}`,
    `TITLE:${escapeVCard(profile.jobTitle)}`,
    profile.mobile ? `TEL;TYPE=CELL:${escapeVCard(profile.mobile)}` : null,
    profile.phone ? `TEL;TYPE=WORK,VOICE:${escapeVCard(profile.phone)}` : null,
    `EMAIL;TYPE=INTERNET,WORK:${escapeVCard(profile.email)}`,
    `URL:${escapeVCard(profile.website)}`,
    `ADR;TYPE=WORK:;;${escapeVCard(profile.address)};${escapeVCard(profile.city)};;;${escapeVCard(profile.country)}`,
    profile.photoUrl ? `PHOTO;VALUE=URI:${escapeVCard(profile.photoUrl)}` : null,
    noteParts.length ? `NOTE:${escapeVCard(noteParts.join(" — "))}` : null,
    ...(profile.socialLinks ?? []).map(
      (link) =>
        `X-SOCIALPROFILE;TYPE=${escapeVCard(link.label.toLowerCase())}:${escapeVCard(link.url)}`
    ),
    "END:VCARD"
  ].filter(Boolean);

  return `${lines.join("\r\n")}\r\n`;
}
