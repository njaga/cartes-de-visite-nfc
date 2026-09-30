import path from "node:path";
import { contentTypeForFile, getUploadedImage } from "@/lib/uploads";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ file: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { file } = await context.params;
  const safeName = path.basename(file);
  const expectedType = contentTypeForFile(safeName);

  if (!expectedType || safeName !== file) {
    return new Response("Fichier introuvable", { status: 404 });
  }

  const asset = await getUploadedImage(safeName);
  if (!asset) {
    return new Response("Fichier introuvable", { status: 404 });
  }

  return new Response(new Uint8Array(asset.bytes), {
    headers: {
      "Content-Type": asset.contentType,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
