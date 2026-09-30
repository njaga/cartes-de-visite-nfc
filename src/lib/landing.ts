export type CardService = {
  id?: number;
  title: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  sortOrder?: number;
};

export type CardResource = {
  id?: number;
  title: string;
  description?: string;
  resourceType: "pdf" | "video" | "catalogue" | "link";
  url: string;
  thumbnailUrl?: string;
  sortOrder?: number;
};

export type CardGalleryImage = {
  id?: number;
  imageUrl: string;
  altText?: string;
  caption?: string;
  sortOrder?: number;
};

export type CardHighlight = {
  id?: number;
  value?: string;
  label: string;
  sortOrder?: number;
};

export type CardCampaign = {
  id?: number;
  title: string;
  description?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  startsAt?: string;
  endsAt?: string;
  active: boolean;
};

export type CardLandingData = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  heroBadge?: string;
  aboutText?: string;
  languages: string[];
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  bookingUrl?: string;
  leadFormEnabled: boolean;
  services: CardService[];
  resources: CardResource[];
  gallery: CardGalleryImage[];
  highlights: CardHighlight[];
  campaign?: CardCampaign;
};

export type CardLead = {
  id: number;
  cardId: number;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  message?: string;
  source: "nfc" | "qr" | "web";
  status: "new" | "contacted" | "qualified" | "converted";
  createdAt: string;
};
