export type SocialLink = {
  label: string;
  url: string;
};

export type NfcProvisioningStatus = "new" | "programmed" | "tested";

export type DigitalCard = {
  id?: number;
  slug: string;
  nfcToken: string;
  nfcMode: "profile" | "vcard";
  nfcStatus?: NfcProvisioningStatus;
  programmedAt?: string;
  testedAt?: string;
  active: boolean;
  firstName: string;
  lastName: string;
  jobTitle: string;
  subsidiary: string;
  company: string;
  mobile?: string;
  whatsapp?: string;
  whatsappMessage?: string;
  phone?: string;
  email: string;
  website: string;
  address: string;
  city: string;
  country: string;
  presentation?: string;
  photoUrl?: string;
  socialLinks?: SocialLink[];
  services?: string[];
  commercialCtaLabel?: string;
  commercialCtaUrl?: string;
  offerTitle?: string;
  offerText?: string;
  offerUrl?: string;
  offerStartDate?: string;
  offerEndDate?: string;
  brochureLabel?: string;
  brochureUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const seedProfiles: DigitalCard[] = [
  {
    slug: "demo-vigilus",
    nfcToken: "vig-demo-001",
    nfcMode: "profile",
    nfcStatus: "new",
    active: true,
    firstName: "Awa",
    lastName: "Ndiaye",
    jobTitle: "Responsable Développement",
    subsidiary: "Vigilus Sénégal",
    company: "VIGILUS Group",
    mobile: "+221 77 000 00 00",
    whatsapp: "+221 77 000 00 00",
    whatsappMessage:
      "Bonjour Awa, je viens de consulter votre carte Vigilus et je souhaite échanger au sujet de nos besoins.",
    phone: "+221 33 867 77 32",
    email: "awa.ndiaye@example.com",
    website: "https://www.groupevigilus.com",
    address: "VDN, Sacré-Cœur 3",
    city: "Dakar",
    country: "Sénégal",
    presentation:
      "J'accompagne les entreprises et institutions dans la mise en place de solutions Vigilus adaptées à leurs enjeux de sécurité, de facility management et de mobilité.",
    services: [
      "Sécurité humaine",
      "Sécurité électronique",
      "Facility Management",
      "Mobilité professionnelle"
    ],
    commercialCtaLabel: "Découvrir nos solutions",
    commercialCtaUrl: "https://www.groupevigilus.com",
    socialLinks: [
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com"
      }
    ]
  }
];
