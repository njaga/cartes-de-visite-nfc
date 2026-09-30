export type BrandConfig = {
  subsidiary: string;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
};

export const defaultBrandConfigs: BrandConfig[] = [
  { subsidiary: "Vigilus Sénégal", primaryColor: "#13a3e3", accentColor: "#c30c29" },
  { subsidiary: "Vigilus Côte d’Ivoire", primaryColor: "#13a3e3", accentColor: "#c30c29" },
  { subsidiary: "Vigilus Sierra Leone", primaryColor: "#13a3e3", accentColor: "#c30c29" },
  { subsidiary: "Vigilus Guinée", primaryColor: "#13a3e3", accentColor: "#c30c29" },
  { subsidiary: "Vigilus Mobility", primaryColor: "#13a3e3", accentColor: "#c30c29" },
  { subsidiary: "Vigilus Properties", primaryColor: "#13a3e3", accentColor: "#c30c29" },
  { subsidiary: "VIGILUS Group", primaryColor: "#13a3e3", accentColor: "#c30c29" }
];

export function defaultBrandFor(subsidiary: string): BrandConfig {
  return (
    defaultBrandConfigs.find((brand) => brand.subsidiary === subsidiary) ?? {
      subsidiary,
      primaryColor: "#13a3e3",
      accentColor: "#c30c29"
    }
  );
}
