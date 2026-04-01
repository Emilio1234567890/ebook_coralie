"use client";

import { Header } from "@/components/Header";
import { motion } from "framer-motion";

export default function ConditionsGeneralesPage() {
  return (
    <>
      <Header />

      <main className="page">
        <div className="container">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lux-card p-6 sm:p-8 lg:p-10"
          >
            <p className="lux-kicker">informations légales</p>
            <h1 className="mt-4 text-4xl text-white sm:text-5xl">
              Conditions générales de vente
            </h1>

            <div className="mt-8 space-y-8 text-white/72 leading-8">
              <section>
                <h2 className="text-2xl text-white">1. Objet</h2>
                <p className="mt-3">
                  Les présentes conditions générales de vente encadrent l’achat
                  de l’ebook « Une béninoise en Martinique » proposé en ligne.
                </p>
              </section>

              <section>
                <h2 className="text-2xl text-white">2. Produit</h2>
                <p className="mt-3">
                  Le produit vendu est un contenu numérique accessible en ligne
                  après validation du paiement. Aucun support physique n’est
                  expédié.
                </p>
              </section>

              <section>
                <h2 className="text-2xl text-white">3. Prix</h2>
                <p className="mt-3">
                  Le prix affiché sur le site est indiqué en euros. Le paiement
                  est exigible immédiatement lors de la commande.
                </p>
              </section>

              <section>
                <h2 className="text-2xl text-white">4. Accès</h2>
                <p className="mt-3">
                  Après paiement confirmé, l’accès à l’ebook est activé dans
                  l’espace personnel de l’utilisateur.
                </p>
              </section>

              <section>
                <h2 className="text-2xl text-white">
                  5. Droit de rétractation
                </h2>
                <p className="mt-3">
                  Conformément aux règles applicables aux contenus numériques
                  fournis immédiatement après achat, le client reconnaît qu’en
                  validant sa commande et en demandant l’accès immédiat au
                  contenu, il renonce à son droit de rétractation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl text-white">6. Usage personnel</h2>
                <p className="mt-3">
                  L’ebook est réservé à un usage strictement personnel. Toute
                  reproduction, diffusion, partage, revente ou mise à
                  disposition gratuite ou payante est interdite sans
                  autorisation écrite préalable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl text-white">7. Responsabilité</h2>
                <p className="mt-3">
                  L’éditeur ne pourra être tenu responsable d’une
                  indisponibilité temporaire du service, d’un problème technique
                  indépendant de sa volonté ou d’une mauvaise utilisation du
                  compte par l’utilisateur.
                </p>
              </section>

              <section>
                <h2 className="text-2xl text-white">8. Contact</h2>
                <p className="mt-3">
                  Pour toute question, l’utilisateur peut contacter le support à
                  l’adresse email indiquée sur le site.
                </p>
              </section>
            </div>
          </motion.section>
        </div>
      </main>
    </>
  );
}
