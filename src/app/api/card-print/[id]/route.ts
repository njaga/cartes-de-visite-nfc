import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFImage,
  type PDFPage
} from "@cantoo/pdf-lib";
import { getAdminUser } from "@/lib/admin-auth";
import { getBrandConfig, getCardById } from "@/lib/db";
import { uploadsDirectory } from "@/lib/uploads";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const PT_PER_MM = 72 / 25.4;
const mm = (value: number) => value * PT_PER_MM;

function hexColor(value: string) {
  const normalized = value.replace("#", "").padEnd(6, "0").slice(0, 6);
  const red = parseInt(normalized.slice(0, 2), 16) / 255;
  const green = parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = parseInt(normalized.slice(4, 6), 16) / 255;
  return rgb(red, green, blue);
}

function qrMatrix(value: string) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
  return { size: qr.modules.size, data: qr.modules.data };
}

function drawQr(page: PDFPage, value: string, x: number, y: number, size: number) {
  const matrix = qrMatrix(value);
  const cell = size / matrix.size;

  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (matrix.data[row * matrix.size + col]) {
        page.drawRectangle({
          x: x + col * cell,
          y: y + (matrix.size - row - 1) * cell,
          width: cell + 0.12,
          height: cell + 0.12,
          color: rgb(0.065, 0.133, 0.188)
        });
      }
    }
  }
}

function drawTrimMarks(page: PDFPage) {
  const bleed = mm(3);
  const trimWidth = mm(85.6);
  const trimHeight = mm(54);
  const pageWidth = mm(91.6);
  const pageHeight = mm(60);
  const mark = mm(2.2);
  const stroke = rgb(0.35, 0.35, 0.35);

  const segments = [
    [bleed - mark, bleed, bleed - 0.3, bleed],
    [bleed, bleed - mark, bleed, bleed - 0.3],
    [bleed + trimWidth + 0.3, bleed, bleed + trimWidth + mark, bleed],
    [bleed + trimWidth, bleed - mark, bleed + trimWidth, bleed - 0.3],
    [bleed - mark, bleed + trimHeight, bleed - 0.3, bleed + trimHeight],
    [bleed, bleed + trimHeight + 0.3, bleed, bleed + trimHeight + mark],
    [bleed + trimWidth + 0.3, bleed + trimHeight, bleed + trimWidth + mark, bleed + trimHeight],
    [bleed + trimWidth, bleed + trimHeight + 0.3, bleed + trimWidth, bleed + trimHeight + mark]
  ];

  for (const [x1, y1, x2, y2] of segments) {
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 0.45, color: stroke });
  }

}

async function embedBrandLogo(document: PDFDocument, logoUrl?: string) {
  const fallback = "/branding/vigilus-groupe-sa.png";
  const source = logoUrl || fallback;

  try {
    if (source.startsWith("/branding/")) {
      const filename = path.basename(source);
      const bytes = await readFile(path.join(process.cwd(), "public", "branding", filename));
      const extension = path.extname(filename).toLowerCase();
      return extension === ".jpg" || extension === ".jpeg"
        ? document.embedJpg(bytes)
        : document.embedPng(bytes);
    }

    if (source.startsWith("/uploads/")) {
      const filename = path.basename(source);
      const bytes = await readFile(path.join(uploadsDirectory(), filename));
      const extension = path.extname(filename).toLowerCase();
      if (extension === ".jpg" || extension === ".jpeg") return document.embedJpg(bytes);
      if (extension === ".png") return document.embedPng(bytes);
    }
  } catch {
    // Fallback below.
  }

  const fallbackBytes = await readFile(
    path.join(process.cwd(), "public", "branding", "vigilus-groupe-sa.png")
  );
  return document.embedPng(fallbackBytes);
}

async function embedLocalPhoto(document: PDFDocument, photoUrl?: string) {
  if (!photoUrl?.startsWith("/uploads/")) return undefined;

  const filename = path.basename(photoUrl);
  const extension = path.extname(filename).toLowerCase();

  if (![".png", ".jpg", ".jpeg"].includes(extension)) return undefined;

  try {
    const bytes = await readFile(path.join(uploadsDirectory(), filename));
    return extension === ".png" ? document.embedPng(bytes) : document.embedJpg(bytes);
  } catch {
    return undefined;
  }
}

function drawFittedImage(page: PDFPage, image: PDFImage, x: number, y: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
  page.drawImage(image, {
    x,
    y,
    width: image.width * scale,
    height: image.height * scale
  });
}

export async function GET(request: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) return new Response("Non autorisé", { status: 401 });

  const { id } = await context.params;
  const card = getCardById(Number(id));
  if (!card) return new Response("Carte introuvable", { status: 404 });

  const brand = getBrandConfig(card.subsidiary);
  const requestUrl = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || requestUrl.origin;
  const nfcUrl = origin + "/n/" + card.nfcToken;

  const pdf = await PDFDocument.create();
  pdf.setTitle("Carte NFC - " + card.firstName + " " + card.lastName);
  pdf.setAuthor("VIGILUS Group");
  pdf.setSubject("BAT carte de visite NFC");
  pdf.setCreator("Vigilus Digital Cards");

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedBrandLogo(pdf, brand.logoUrl);
  const photo = await embedLocalPhoto(pdf, card.photoUrl);

  const pageWidth = mm(91.6);
  const pageHeight = mm(60);
  const bleed = mm(3);
  const trimWidth = mm(85.6);
  const trimHeight = mm(54);
  const primary = hexColor(brand.primaryColor);
  const accent = hexColor(brand.accentColor);
  const ink = rgb(0.063, 0.133, 0.188);
  const muted = rgb(0.39, 0.47, 0.53);
  const line = rgb(0.89, 0.93, 0.95);

  const front = pdf.addPage([pageWidth, pageHeight]);
  front.setTrimBox(bleed, bleed, trimWidth, trimHeight);
  front.setBleedBox(0, 0, pageWidth, pageHeight);
  front.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: rgb(1, 1, 1) });
  front.drawRectangle({ x: bleed, y: bleed, width: mm(1), height: trimHeight, color: primary });
  front.drawRectangle({ x: bleed + mm(1), y: bleed, width: mm(0.45), height: trimHeight, color: accent });

  drawFittedImage(front, logo, bleed + mm(4.5), bleed + trimHeight - mm(16), mm(22), mm(13));

  front.drawText(card.subsidiary.toUpperCase(), {
    x: bleed + mm(4.5),
    y: bleed + trimHeight - mm(18.6),
    size: 5.8,
    font: bold,
    color: primary
  });

  front.drawText((card.firstName + " " + card.lastName).slice(0, 30), {
    x: bleed + mm(4.5),
    y: bleed + mm(25.8),
    size: 13.2,
    font: bold,
    color: ink
  });

  front.drawText(card.jobTitle.slice(0, 52), {
    x: bleed + mm(4.5),
    y: bleed + mm(21.1),
    size: 6.9,
    font: bold,
    color: muted
  });

  if (photo) {
    const photoSize = mm(18);
    const px = bleed + trimWidth - mm(24);
    const py = bleed + trimHeight - mm(27);
    const ratio = Math.min(photoSize / photo.width, photoSize / photo.height);
    const width = photo.width * ratio;
    const height = photo.height * ratio;
    front.drawRectangle({ x: px - mm(1), y: py - mm(1), width: photoSize + mm(2), height: photoSize + mm(2), color: rgb(0.96, 0.98, 0.99) });
    front.drawImage(photo, {
      x: px + (photoSize - width) / 2,
      y: py + (photoSize - height) / 2,
      width,
      height
    });
  } else {
    front.drawCircle({
      x: bleed + trimWidth - mm(15),
      y: bleed + trimHeight - mm(17),
      size: mm(9),
      color: rgb(0.93, 0.97, 0.99)
    });
  }

  front.drawLine({
    start: { x: bleed + mm(4.5), y: bleed + mm(17.4) },
    end: { x: bleed + trimWidth - mm(4.5), y: bleed + mm(17.4) },
    thickness: 0.7,
    color: line
  });

  const details = [
    card.mobile ? "T. " + card.mobile : null,
    card.email,
    card.website.replace(/^https?:\/\//, "")
  ].filter(Boolean) as string[];

  details.forEach((detail, index) => {
    front.drawText(detail.slice(0, 58), {
      x: bleed + mm(4.5),
      y: bleed + mm(12.8 - index * 3.6),
      size: 5.8,
      font: regular,
      color: muted
    });
  });

  front.drawRectangle({ x: bleed + trimWidth - mm(18), y: bleed + mm(4), width: mm(4.5), height: mm(0.55), color: accent });
  front.drawRectangle({ x: bleed + trimWidth - mm(13.5), y: bleed + mm(4), width: mm(4.5), height: mm(0.55), color: line });
  front.drawRectangle({ x: bleed + trimWidth - mm(9), y: bleed + mm(4), width: mm(4.5), height: mm(0.55), color: primary });

  drawTrimMarks(front);

  const back = pdf.addPage([pageWidth, pageHeight]);
  back.setTrimBox(bleed, bleed, trimWidth, trimHeight);
  back.setBleedBox(0, 0, pageWidth, pageHeight);
  back.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: rgb(1, 1, 1) });
  back.drawRectangle({ x: bleed, y: bleed + trimHeight - mm(1), width: trimWidth, height: mm(1), color: primary });
  drawFittedImage(back, logo, bleed + mm(4.5), bleed + trimHeight - mm(15), mm(19), mm(11));

  const qrSize = mm(22);
  const qrX = bleed + trimWidth - mm(29);
  const qrY = bleed + mm(14);
  back.drawRectangle({ x: qrX - mm(2.2), y: qrY - mm(2.2), width: qrSize + mm(4.4), height: qrSize + mm(4.4), color: rgb(0.97, 0.985, 0.99) });
  drawQr(back, nfcUrl + "?src=qr", qrX, qrY, qrSize);

  back.drawText("Approchez votre téléphone", {
    x: bleed + mm(4.5),
    y: bleed + mm(22),
    size: 10.2,
    font: bold,
    color: ink
  });
  back.drawText("ou scannez le QR code pour ouvrir", {
    x: bleed + mm(4.5),
    y: bleed + mm(17.7),
    size: 6.2,
    font: regular,
    color: muted
  });
  back.drawText("la carte digitale et enregistrer le contact.", {
    x: bleed + mm(4.5),
    y: bleed + mm(14.2),
    size: 6.2,
    font: regular,
    color: muted
  });
  back.drawText(card.firstName + " " + card.lastName, {
    x: bleed + mm(4.5),
    y: bleed + mm(8),
    size: 6.2,
    font: bold,
    color: primary
  });
  back.drawText(card.subsidiary, {
    x: bleed + mm(4.5),
    y: bleed + mm(5),
    size: 5.2,
    font: regular,
    color: muted
  });

  back.drawRectangle({ x: bleed, y: bleed, width: trimWidth / 3, height: mm(2.2), color: accent });
  back.drawRectangle({ x: bleed + trimWidth / 3, y: bleed, width: trimWidth / 3, height: mm(2.2), color: rgb(1, 1, 1) });
  back.drawRectangle({ x: bleed + (trimWidth / 3) * 2, y: bleed, width: trimWidth / 3, height: mm(2.2), color: primary });

  drawTrimMarks(back);

  const bytes = await pdf.save();

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="' + card.slug + '-bat-impression.pdf"',
      "Cache-Control": "private, no-store"
    }
  });
}
