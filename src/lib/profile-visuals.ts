/** Official Vigilus photographs, bundled locally so the profile does not depend on a remote image host. */
export function serviceImageFor(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (/electron|surveillance|alarme|camera|technolog/.test(normalized))
    return "/profile-images/electronic-security.webp";
  if (/secur|gardien|protect|surete/.test(normalized))
    return "/profile-images/security.webp";
  if (/mobil|transport|vehicul|logist|auto/.test(normalized))
    return "/profile-images/mobility.webp";
  if (/facilit|nettoy|entretien|maintenance|hygiene|proprete/.test(normalized))
    return "/profile-images/facility-management.webp";
  return "/profile-images/cover.webp";
}
