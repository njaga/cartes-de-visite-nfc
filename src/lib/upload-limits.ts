export const MAX_CARD_UPLOAD_BYTES = 4 * 1024 * 1024;
export const CARD_UPLOAD_LIMIT_MESSAGE = "Les images sélectionnées dépassent 4 Mo au total. Réduisez leur taille ou importez-les en plusieurs enregistrements.";

export function exceedsCardUploadLimit(files: Iterable<{ size: number }>) {
  let total = 0;
  for (const file of files) total += file.size;
  return total > MAX_CARD_UPLOAD_BYTES;
}

export function assertCardUploadLimit(formData: FormData) {
  const files = Array.from(formData.values()).filter((entry): entry is File => entry instanceof File);
  if (exceedsCardUploadLimit(files)) throw new Error(CARD_UPLOAD_LIMIT_MESSAGE);
}
