import { readFile } from "node:fs/promises";
import path from "node:path";
import { contentTypeForFile, uploadsDirectory } from "@/lib/uploads";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ file: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { file } = await context.params;
  const safeName = path.basename(file);
  const contentType = contentTypeForFile(safeName);

  if (!contentType || safeName !== file) {
    return new Response("Fichier introuvable", { status: 404 });
  }

  try {
    const bytes = await readFile(path.join(uploadsDirectory(), safeName));
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new Response("Fichier introuvable", { status: 404 });
  }
}
