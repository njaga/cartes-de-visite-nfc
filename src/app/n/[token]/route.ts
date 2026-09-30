import { NextResponse } from "next/server";
import { getProfileByNfcToken, recordScan } from "@/lib/db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const profile = await getProfileByNfcToken(token);

  if (!profile) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const requestUrl = new URL(request.url);
  const source = requestUrl.searchParams.get("src") === "qr" ? "qr" : "nfc";

  await recordScan(token, source, {
    userAgent: request.headers.get("user-agent"),
    referer: request.headers.get("referer")
  });

  const target =
    profile.nfcMode === "vcard"
      ? "/p/" + profile.slug + "/contact.vcf"
      : "/p/" + profile.slug;

  return NextResponse.redirect(new URL(target, request.url), 307);
}
