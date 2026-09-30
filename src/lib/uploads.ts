import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const acceptedTypes: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

export function uploadsDirectory() {
  const dbPath = process.env.DB_PATH?.trim();
  const dataDir = dbPath ? path.dirname(path.resolve(dbPath)) : path.join(process.cwd(), "data");
  return path.join(dataDir, "uploads");
}

export async function saveUploadedImage(file: File) {
  const extension = acceptedTypes[file.type];
  if (!extension) {
    throw new Error("Format photo non accepté. Utilisez JPG, PNG ou WEBP.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La photo dépasse 4 Mo.");
  }

  const directory = uploadsDirectory();
  await mkdir(directory, { recursive: true });

  const filename = randomUUID().replace(/-/g, "") + extension;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(directory, filename), bytes);

  return "/uploads/" + filename;
}

export function contentTypeForFile(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return null;
}
