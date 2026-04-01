export function buildOrderConfirmationEmail({
  customerName,
  productName,
  priceLabel,
  libraryUrl,
}) {
  const safeName = customerName || "Bonjour";
  const safeProduct = productName || "Une béninoise en Martinique";
  const safePrice = priceLabel || "14,99 €";
  const safeLibraryUrl = libraryUrl || "#";

  const subject = "Commande confirmée — Une béninoise en Martinique";

  const text = `${safeName},

Merci pour votre commande.

Votre achat a bien été confirmé :
- Produit : ${safeProduct}
- Montant : ${safePrice}

Vous pouvez désormais accéder à votre bibliothèque privée ici :
${safeLibraryUrl}

Merci pour votre confiance.

Une béninoise en Martinique
`;

  const html = `
    <div style="margin:0;padding:0;background:#0a0f18;">
      <div style="max-width:680px;margin:0 auto;padding:24px;">
        <div style="overflow:hidden;border-radius:28px;border:1px solid rgba(255,255,255,0.10);background:linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),#121a26;box-shadow:0 24px 80px rgba(0,0,0,0.35);font-family:Georgia,'Times New Roman',serif;color:#f5f0e6;">

          <div style="position:relative;padding:0;">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80"
              alt="Martinique"
              style="display:block;width:100%;height:260px;object-fit:cover;"
            />
            <div style="padding:32px 32px 20px;">
              <div style="display:inline-block;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.05);font-size:11px;letter-spacing:0.26em;text-transform:uppercase;color:rgba(245,240,230,0.78);">
                commande confirmée
              </div>

              <h1 style="margin:18px 0 0;font-size:48px;line-height:0.98;font-weight:500;color:#fff8ee;">
                Merci pour votre commande
              </h1>

              <p style="margin:18px 0 0;font-size:18px;line-height:1.8;color:rgba(245,240,230,0.78);">
                Votre accès à l’édition <strong style="color:#fff;">${safeProduct}</strong> est maintenant actif.
              </p>
            </div>
          </div>

          <div style="padding:8px 32px 32px;">
            <div style="border-radius:22px;border:1px solid rgba(255,255,255,0.10);background:rgba(255,255,255,0.04);padding:22px;">
              <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,240,230,0.45);">
                détail
              </p>
              <p style="margin:0 0 8px;font-size:18px;color:#fff;">
                <strong>Client :</strong> ${safeName}
              </p>
              <p style="margin:0 0 8px;font-size:18px;color:#fff;">
                <strong>Produit :</strong> ${safeProduct}
              </p>
              <p style="margin:0;font-size:18px;color:#fff;">
                <strong>Montant :</strong> ${safePrice}
              </p>
            </div>

            <p style="margin:26px 0 0;font-size:17px;line-height:1.9;color:rgba(245,240,230,0.78);">
              Merci pour votre confiance. Nous sommes heureux de vous accueillir dans cette expérience de lecture pensée comme un espace intime, élégant et immersif.
            </p>

            <div style="margin-top:28px;">
              <a
                href="${safeLibraryUrl}"
                style="display:inline-block;padding:15px 22px;border-radius:16px;background:linear-gradient(180deg,#f5e0af,#d4b060);color:#17130d;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;box-shadow:0 14px 34px rgba(212,176,96,0.22);"
              >
                Ouvrir ma bibliothèque
              </a>
            </div>

            <div style="margin-top:28px;padding-top:22px;border-top:1px solid rgba(255,255,255,0.08);font-size:14px;line-height:1.8;color:rgba(245,240,230,0.50);">
              Une béninoise en Martinique<br />
              Merci pour votre présence.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

export function buildAdminReplyEmail({
  customerName,
  subjectLine,
  htmlContent,
}) {
  const subject = subjectLine || "Réponse à votre message";

  const text = `${customerName || "Bonjour"},

Vous avez reçu une réponse à votre message.

Consultez la version HTML de cet email pour la mise en forme complète.
`;

  const html = `
    <div style="margin:0;padding:0;background:#0a0f18;">
      <div style="max-width:680px;margin:0 auto;padding:24px;">
        <div style="overflow:hidden;border-radius:28px;border:1px solid rgba(255,255,255,0.10);background:linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),#121a26;box-shadow:0 24px 80px rgba(0,0,0,0.35);font-family:Arial,sans-serif;color:#f5f0e6;">
          <div style="padding:32px;">
            <div style="display:inline-block;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.05);font-size:11px;letter-spacing:0.26em;text-transform:uppercase;color:rgba(245,240,230,0.78);">
              réponse
            </div>

            <h1 style="margin:18px 0 0;font-size:34px;line-height:1.1;font-weight:700;color:#fff8ee;">
              ${subject}
            </h1>

            <div style="margin-top:24px;font-size:16px;line-height:1.8;color:rgba(245,240,230,0.88);">
              ${htmlContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
