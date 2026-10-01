"use client";

import { useState, type ReactNode } from "react";
import { CARD_UPLOAD_LIMIT_MESSAGE, exceedsCardUploadLimit } from "@/lib/upload-limits";

function fileInputs(form: HTMLFormElement) {
  return Array.from(form.querySelectorAll<HTMLInputElement>('input[type="file"]'));
}

function validateUploads(form: HTMLFormElement) {
  const inputs = fileInputs(form);
  inputs.forEach((input) => input.setCustomValidity(""));
  const files = inputs.flatMap((input) => Array.from(input.files ?? []));
  const error = exceedsCardUploadLimit(files) ? CARD_UPLOAD_LIMIT_MESSAGE : "";
  if (error) inputs.find((input) => Boolean(input.files?.length))?.setCustomValidity(error);
  return error;
}

export function AdminCardFormShell({
  action,
  children
}: {
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
}) {
  const [uploadError, setUploadError] = useState("");

  return (
    <form
      className="admin-form"
      action={action}
      onChange={(event) => setUploadError(validateUploads(event.currentTarget))}
      onClickCapture={(event) => {
        // A removed service also removes its file; do not leave another input invalid.
        if (event.target instanceof Element && event.target.closest('button[type="button"]')) {
          fileInputs(event.currentTarget).forEach((input) => input.setCustomValidity(""));
          setUploadError("");
        }
      }}
      onSubmit={(event) => {
        const error = validateUploads(event.currentTarget);
        setUploadError(error);
        if (error) {
          event.preventDefault();
          event.currentTarget.reportValidity();
        }
      }}
    >
      <p className="admin-help">Images : 4 Mo au total par enregistrement, pour la photo, la couverture et les services réunis. Vous pouvez ajouter les autres images lors d’un enregistrement suivant.</p>
      {uploadError && <p role="alert" className="admin-help">{uploadError}</p>}
      {children}
    </form>
  );
}
