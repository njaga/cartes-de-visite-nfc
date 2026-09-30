import * as XLSX from "xlsx";
import { getAdminUser } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return new Response("Non autorisé", { status: 401 });

  const headers = [
    "Prénom",
    "Nom",
    "Poste",
    "Filiale",
    "Entreprise",
    "Téléphone portable",
    "WhatsApp",
    "Message WhatsApp",
    "Téléphone fixe",
    "Email",
    "Site web",
    "Adresse",
    "Ville",
    "Pays",
    "Présentation",
    "Photo URL",
    "Services",
    "CTA commercial",
    "Lien CTA",
    "Titre offre",
    "Texte offre",
    "Lien offre",
    "Début offre",
    "Fin offre",
    "Libellé brochure",
    "Lien brochure",
    "LinkedIn",
    "Facebook",
    "Instagram",
    "X",
    "Actif"
  ];

  const sample = [
    "Awa",
    "Ndiaye",
    "Responsable Développement",
    "Vigilus Sénégal",
    "VIGILUS Group",
    "+221 77 000 00 00",
    "+221 77 000 00 00",
    "Bonjour, je viens de consulter votre carte Vigilus et je souhaite échanger.",
    "+221 33 867 77 32",
    "awa.ndiaye@example.com",
    "https://www.groupevigilus.com",
    "VDN Sacré-Cœur 3",
    "Dakar",
    "Sénégal",
    "Présentation professionnelle courte.",
    "",
    "Sécurité humaine; Sécurité électronique; Facility Management",
    "Découvrir nos solutions",
    "https://www.groupevigilus.com",
    "",
    "",
    "",
    "",
    "",
    "Voir notre brochure",
    "",
    "https://www.linkedin.com/",
    "",
    "",
    "",
    "Oui"
  ];

  const sheet = XLSX.utils.aoa_to_sheet([headers, sample]);
  sheet["!cols"] = headers.map((header) => ({ wch: Math.max(16, header.length + 3) }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Collaborateurs");
  const output = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;

  return new Response(new Uint8Array(output), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="modele-import-cartes-vigilus.xlsx"'
    }
  });
}
