export type BrandConfig = {
  subsidiary: string;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
};

export const BRAND_LOGOS = {
  group: "/branding/vigilus-groupe-sa.png",
  facilities: "/branding/vigilus-facilities.png",
  mobility: "/branding/vigilus-mobility.png",
  properties: "/branding/vigilus-properties.png",
  international: "/branding/vigilus-international.png"
} as const;

export const VIGILUS_LOGO_URL = BRAND_LOGOS.group;

export const defaultBrandConfigs: BrandConfig[] = [
  { subsidiary: "Vigilus Sénégal", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: BRAND_LOGOS.group },
  { subsidiary: "Vigilus Côte d’Ivoire", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: BRAND_LOGOS.group },
  { subsidiary: "Vigilus Sierra Leone", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: BRAND_LOGOS.facilities },
  { subsidiary: "Vigilus Guinée", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: BRAND_LOGOS.group },
  { subsidiary: "Vigilus Mobility", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: BRAND_LOGOS.mobility },
  { subsidiary: "Vigilus Properties", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: BRAND_LOGOS.properties },
  { subsidiary: "Vigilus Facilities", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: BRAND_LOGOS.facilities },
  { subsidiary: "Vigilus International", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: BRAND_LOGOS.international },
  { subsidiary: "Vigilus Dubaï", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: BRAND_LOGOS.international },
  { subsidiary: "VIGILUS Group", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: BRAND_LOGOS.group }
];

export function defaultBrandFor(subsidiary: string): BrandConfig {
  return (
    defaultBrandConfigs.find((brand) => brand.subsidiary === subsidiary) ?? {
      subsidiary,
      primaryColor: "#13a3e3",
      accentColor: "#c30c29",
      logoUrl: BRAND_LOGOS.group
    }
  );
}
