export default function HomePage() {
  return (
    <main className="landing-shell">
      <section className="landing-card">
        <div className="vigilus-logo-lockup">
          <img src="/branding/vigilus-groupe-sa.png" alt="Vigilus" />
          <small>Digital Business Cards</small>
        </div>

        <div className="landing-copy">
          <span className="eyebrow">NFC + QR + vCard</span>
          <h1>Une carte physique. Un contact toujours à jour.</h1>
          <p>
            Les cartes digitales Vigilus permettent d’ouvrir un profil professionnel,
            d’enregistrer le contact et de retrouver les coordonnées à jour depuis un
            simple geste NFC ou un QR code.
          </p>
        </div>

        <div className="landing-actions">
          <a className="admin-primary-button" href="/admin/login">
            Administration
          </a>
        </div>
      </section>
    </main>
  );
}
