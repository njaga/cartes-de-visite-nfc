import { NextResponse } from "next/server";
import { getProfileByNfcToken } from "@/lib/profiles";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const profile = getProfileByNfcToken(token);

  if (!profile) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const target =
    profile.nfcMode === "vcard"
      ? `/p/${profile.slug}/contact.vcf`
      : `/p/${profile.slug}`;

  return NextResponse.redirect(new URL(target, request.url), 307);
}
