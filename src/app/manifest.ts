import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vigilus Digital Cards",
    short_name: "Vigilus Cards",
    description: "Gestion mobile des cartes de visite digitales NFC Vigilus.",
    start_url: "/admin",
    display: "standalone",
    background_color: "#f4f7f9",
    theme_color: "#13a3e3",
    lang: "fr"
  };
}
