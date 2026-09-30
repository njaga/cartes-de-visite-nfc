import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "vigilus_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!value) throw new Error("ADMIN_SESSION_SECRET is required for the admin area.");
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encodeSession(email: string, expiresAt: number) {
  const payload = email + ":" + expiresAt;
  return Buffer.from(payload + ":" + sign(payload)).toString("base64url");
}

function decodeSession(token: string) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length < 3) return null;

    const signature = parts.pop()!;
    const expiresAtRaw = parts.pop()!;
    const email = parts.join(":");
    const expiresAt = Number(expiresAtRaw);

    if (!email || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;

    const payload = email + ":" + expiresAt;
    if (!safeEqual(signature, sign(payload))) return null;

    return { email, expiresAt };
  } catch {
    return null;
  }
}

export function adminIsConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL?.trim() &&
      process.env.ADMIN_PASSWORD?.trim() &&
      process.env.ADMIN_SESSION_SECRET?.trim()
  );
}

export function verifyAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim();
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!expectedEmail || !expectedPassword) return false;

  return safeEqual(email.trim().toLowerCase(), expectedEmail.toLowerCase()) &&
    safeEqual(password, expectedPassword);
}

export async function createAdminSession(email: string) {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, encodeSession(email, expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminUser() {
  if (!adminIsConfigured()) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
