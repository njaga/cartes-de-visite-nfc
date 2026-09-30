export type BrandConfig = {
  subsidiary: string;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
};

export const VIGILUS_LOGO_URL = "/branding/vigilus-logo.png";

export const defaultBrandConfigs: BrandConfig[] = [
  { subsidiary: "Vigilus Sénégal", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: VIGILUS_LOGO_URL },
  { subsidiary: "Vigilus Côte d’Ivoire", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: VIGILUS_LOGO_URL },
  { subsidiary: "Vigilus Sierra Leone", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: VIGILUS_LOGO_URL },
  { subsidiary: "Vigilus Guinée", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: VIGILUS_LOGO_URL },
  { subsidiary: "Vigilus Mobility", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: VIGILUS_LOGO_URL },
  { subsidiary: "Vigilus Properties", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: VIGILUS_LOGO_URL },
  { subsidiary: "VIGILUS Group", primaryColor: "#13a3e3", accentColor: "#c30c29", logoUrl: VIGILUS_LOGO_URL }
];

export function defaultBrandFor(subsidiary: string): BrandConfig {
  return (
    defaultBrandConfigs.find((brand) => brand.subsidiary === subsidiary) ?? {
      subsidiary,
      primaryColor: "#13a3e3",
      accentColor: "#c30c29",
      logoUrl: VIGILUS_LOGO_URL
    }
  );
}
