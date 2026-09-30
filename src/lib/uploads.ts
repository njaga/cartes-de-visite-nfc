import { randomUUID } from "node:crypto";
import { getMediaAsset, saveMediaAsset } from "@/lib/db";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const acceptedTypes: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

export async function saveUploadedImage(file: File) {
  const extension = acceptedTypes[file.type];
  if (!extension) {
    throw new Error("Format photo non accepté. Utilisez JPG, PNG ou WEBP.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La photo dépasse 4 Mo.");
  }

  const filename = randomUUID().replace(/-/g, "") + extension;
  const bytes = Buffer.from(await file.arrayBuffer());
  await saveMediaAsset(filename, file.type, bytes.toString("base64"));

  return "/uploads/" + filename;
}

export async function getUploadedImage(filename: string) {
  const asset = await getMediaAsset(filename);
  if (!asset) return undefined;

  return {
    contentType: asset.mimeType,
    bytes: Buffer.from(asset.dataBase64, "base64")
  };
}

export function contentTypeForFile(filename: string) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return null;
}
