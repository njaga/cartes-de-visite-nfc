/** Calendar links are opened separately and must use an explicit HTTPS origin. */
export function calendarUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

/** Keep optional admin calendar links consistent with public appointment links. */
export function optionalCalendarUrl(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  const validated = calendarUrl(value);
  if (validated) return validated;
  throw new Error("Utilisez un lien de rendez-vous HTTPS valide, sans identifiant ni mot de passe.");
}

/** Accept one ordinary mailbox, including plus tags and apostrophes, never URI headers. */
export function contactEmail(value: string): string | undefined {
  const address = value.trim();
  const [localPart, domain, extra] = address.split("@");
  if (!localPart || !domain || extra !== undefined || address.length > 254)
    return undefined;
  if (
    localPart.length > 64 ||
    !/^[a-z0-9.!#$%&'*+\-/=?^_`{|}~]+$/i.test(localPart) ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    /%(?:0a|0d)/i.test(localPart)
  )
    return undefined;
  const labels = domain.split(".");
  return labels.length > 1 &&
    labels.every((label) =>
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label),
    )
    ? address
    : undefined;
}

/** wa.me expects international digits without +, spaces, or the international 00 prefix. */
export function contactPhone(value?: string): string | undefined {
  if (!value || !/^\+?[\d\s().-]+$/.test(value.trim())) return undefined;
  const digits = value.replace(/\D/g, "").replace(/^00/, "");
  return /^[1-9]\d{6,14}$/.test(digits) ? digits : undefined;
}

export function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Dates without a time may be today; explicit times must still be in the future. */
export function requestedAppointmentDate(
  date: string,
  time: string,
  now = new Date(),
): Date | undefined {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
  )
    return undefined;
  const requestedDate = new Date(`${date}T${time || "23:59"}:00`);
  if (!time) requestedDate.setSeconds(59, 999);
  if (
    Number.isNaN(requestedDate.getTime()) ||
    localDate(requestedDate) !== date ||
    requestedDate <= now ||
    (time &&
      `${String(requestedDate.getHours()).padStart(2, "0")}:${String(requestedDate.getMinutes()).padStart(2, "0")}` !==
        time)
  )
    return undefined;
  return requestedDate;
}

export function appointmentMailto(
  email: string,
  recipientName: string,
  request: string,
): string | undefined {
  const recipient = contactEmail(email);
  if (!recipient) return undefined;
  const subject = `Demande de rendez-vous avec ${recipientName.replace(/[\r\n]/g, " ")}`;
  return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(request)}`;
}
