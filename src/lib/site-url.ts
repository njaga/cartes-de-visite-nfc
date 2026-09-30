export const DEFAULT_PUBLIC_SITE_URL =
  "https://cartes-de-visite-nfc.vercel.app";

export function getPublicSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_PUBLIC_SITE_URL).replace(/\/$/, "");
}
