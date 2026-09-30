"use client";

import { useState } from "react";

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.6 6.8-4.2M8.6 13.4l6.8 4.2" />
    </svg>
  );
}

export function ProfileShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: "Carte de visite digitale de " + name,
          url
        });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copiez ce lien :", url);
    }
  }

  return (
    <button className="public-share-button" type="button" onClick={share}>
      <ShareIcon />
      <span>{copied ? "Lien copié" : "Partager"}</span>
    </button>
  );
}
