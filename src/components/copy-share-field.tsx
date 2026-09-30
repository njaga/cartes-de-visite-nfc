"use client";

import { useState } from "react";

export function CopyShareField({
  value,
  shareTitle
}: {
  value: string;
  shareTitle: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copiez cette URL :", value);
    }
  }

  async function shareValue() {
    if (!navigator.share) {
      await copyValue();
      return;
    }

    try {
      await navigator.share({
        title: shareTitle,
        text: "URL à écrire dans la carte NFC",
        url: value
      });
    } catch {
      // L'utilisateur peut fermer la feuille de partage sans erreur à afficher.
    }
  }

  return (
    <div className="provision-copy">
      <code>{value}</code>
      <div>
        <button type="button" onClick={copyValue}>
          {copied ? "Copiée ✓" : "Copier l’URL"}
        </button>
        <button type="button" className="secondary" onClick={shareValue}>
          Partager
        </button>
      </div>
    </div>
  );
}
