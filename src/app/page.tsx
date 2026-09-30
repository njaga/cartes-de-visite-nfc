import Link from "next/link";
import { getAllProfiles } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const profiles = getAllProfiles();

  return (
    <main className="landing-shell">
      <section className="landing-card">
        <div className="brand-line">
          <span className="brand-mark">V</span>
          <div>
            <strong>VIGILUS</strong>
            <small>Digital Business Cards</small>
          </div>
        </div>

        <div className="landing-copy">
          <span className="eyebrow">NFC + vCard</span>
          <h1>Une carte physique. Un contact toujours à jour.</h1>
          <p>
            La puce NFC contient une URL stable. Les coordonnées peuvent évoluer
            sans remplacer ni reprogrammer la carte.
          </p>
        </div>

        <div className="demo-list">
          {profiles.map((profile) => (
            <Link className="demo-link" href={`/p/${profile.slug}`} key={profile.slug}>
              <span>
                {profile.firstName} {profile.lastName}
              </span>
              <span>Voir le profil →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
