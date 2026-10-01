"use client";

import { useRef, useState } from "react";
import type { ServiceImage } from "@/lib/profiles";

type ServiceEntry = { key: number; name: string; imageUrl: string };

export function AdminServiceFields({
  services = [],
  serviceImages = []
}: {
  services?: string[];
  serviceImages?: ServiceImage[];
}) {
  const [entries, setEntries] = useState<ServiceEntry[]>(() =>
    services.length
      ? services.slice(0, 8).map((name, key) => ({
          key,
          name,
          imageUrl: serviceImages.find((image) => image.name === name)?.imageUrl ?? ""
        }))
      : [{ key: 0, name: "", imageUrl: "" }]
  );
  const nextKey = useRef(Math.max(1, services.length));

  return (
    <div className="admin-span-2 admin-grid">
      <p className="field-hint">Ajoutez jusqu’à 8 services. Chaque service peut avoir sa propre image ; une illustration sera utilisée par défaut.</p>
      {entries.map((entry, index) => (
        <fieldset key={entry.key} className="admin-form-section admin-grid">
          <legend>Service {index + 1}</legend>
          <input type="hidden" name="serviceKey" value={entry.key} />
          <div className="admin-grid admin-grid-2">
            <label className="admin-span-2">
              <span>Nom du service</span>
              <input name={`serviceName-${entry.key}`} defaultValue={entry.name} placeholder="Ex. Sécurité humaine" maxLength={120} />
            </label>
            <label>
              <span>Importer une image</span>
              <input name={`serviceImageFile-${entry.key}`} type="file" accept="image/jpeg,image/png,image/webp" />
              <small className="field-hint">JPG, PNG ou WEBP · limite partagée de 4 Mo par enregistrement.</small>
            </label>
            <label>
              <span>Ou utiliser une URL d’image</span>
              <input name={`serviceImageUrl-${entry.key}`} type="text" defaultValue={entry.imageUrl} placeholder="https://..." />
              <small className="field-hint">Effacez le lien pour retrouver l’illustration par défaut.</small>
            </label>
          </div>
          <button type="button" className="admin-secondary-button" onClick={() => setEntries((current) => current.filter((item) => item.key !== entry.key))} aria-label={`Supprimer le service ${index + 1}`}>
            Supprimer ce service
          </button>
        </fieldset>
      ))}
      {entries.length < 8 && (
        <button type="button" className="admin-secondary-button" onClick={() => {
          const key = nextKey.current++;
          setEntries((current) => [...current, { key, name: "", imageUrl: "" }]);
        }}>
          + Ajouter un service
        </button>
      )}
    </div>
  );
}
