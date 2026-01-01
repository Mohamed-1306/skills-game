// src/Logic/seedCards.js
import { doc, writeBatch } from "firebase/firestore";

/**
 * Seed (crée/écrase) les 15 cartes dans la collection "cards".
 * À lancer UNE fois.
 */
export async function seedCards(db) {
  const cards = {
    apporte_ton_aide: {
      title: "APPORTE TON AIDE",
      type: "bonne_conduite",
      duration: "journee",
      points: 250,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/apporte_ton_aide.png?alt=media&token=178c4927-ace8-40ff-894c-19400709c581",
    },

    bonjour_equipes_domaine: {
      title: "BONJOUR EQUIPES DOMAINE",
      type: "bonne_conduite",
      duration: "journee",
      points: 250,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/bonjour_equipes_domaine.png?alt=media&token=be279447-7759-4857-b5af-fe90dfc0c286",
    },

    dire_merci_pisteurs: {
      title: "DIRE MERCI A DES PISTEURS",
      type: "bonne_conduite",
      duration: "demi_journee",
      points: 250,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/dire_merci_pisteurs.png?alt=media&token=a0ab2b56-c642-4ab8-a0ac-95bc532d61bf",
    },

    laisse_passer_2_remontees: {
      title: "LAISSE PASSER 2 PERSONNES A CHAQUE REMONTEES",
      type: "contrainte",
      duration: "demi_journee",
      points: 350,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/laisse_passer_2_remontees.png?alt=media&token=7c4d7168-6310-4d90-a0c7-f4a1c81d5be1",
    },

    limite_vitesse_50: {
      title: "LIMITE DE VITESSE 50",
      type: "contrainte",
      duration: "demi_journee",
      points: 350,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/limite_vitesse_50.png?alt=media&token=5e8364b7-b190-4d00-a3f5-536aef9b8b5a",
    },

    materiel_securite: {
      title: "EMPORTE LE MATERIEL DE SECURITE",
      type: "challenge",
      duration: "journee",
      points: 200,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/materiel_securite.png?alt=media&token=bd6affea-9c70-418f-9040-2957bb2ee9bb",
    },

    ne_fume_pas: {
      title: "NE FUME PAS",
      type: "bonne_conduite",
      duration: "demi_journee",
      points: 250,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/ne_fume_pas.png?alt=media&token=3d2d6054-34d8-424a-bad8-4070a10c2412",
    },

    organise: {
      title: "ORGANISE",
      type: "challenge",
      duration: "journee",
      points: 200,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/organise.png?alt=media&token=66a702dd-15c6-4aed-b5f5-a3eaac5748a4",
    },

    paie_l_addition: {
      title: "PAIE L ADDITION",
      type: "challenge",
      duration: "midi",
      points: 200,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/paie_l_addition.png?alt=media&token=50c60537-afc8-490d-8c07-7d9e08b9bc86",
    },

    // ⚠️ ton fichier a un espace dans le nom : "porteur "
    // Ça marche, mais je te conseille de renommer le fichier dans Storage en "porteur.png" (sans espace)
    porteur: {
      title: "PORTEUR",
      type: "contrainte",
      duration: "journee",
      points: 350,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/porteur%20.png?alt=media&token=b2739715-c28a-4c0f-b19b-4bf01dee7741",
    },

    ramasse_dechets: {
      title: "RAMASSE DES DECHETS",
      type: "bonne_conduite",
      duration: "journee",
      points: 250,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/ramasse_dechets.png?alt=media&token=a69f5938-cde0-4424-8a40-b8837826eecc",
    },

    reste_derriere_moi: {
      title: "RESTE DERRIERE MOI",
      type: "contrainte",
      duration: "journee",
      points: 350,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/reste_derriere_moi.png?alt=media&token=b5dcab9e-a3b5-48ba-94bd-76f3806a8563",
    },

    zero_alcool_pistes: {
      title: "PAS D ALCOOL SUR LES PISTES",
      type: "contrainte",
      duration: "journee",
      points: 350,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/zero_alcool_pistes.png?alt=media&token=c60ccf51-3c2f-4fa2-b5da-e39cccaaa580",
    },

    zero_arret_descente: {
      title: "0 ARRET SUR UNE DESCENTE",
      type: "challenge",
      duration: "demi_journee",
      points: 200,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/zero_arret_descente.png?alt=media&token=8608ec28-af59-41e5-b16f-6f105b6993b4",
    },

    zero_chute: {
      title: "0 CHUTE",
      type: "challenge",
      duration: "journee",
      points: 200,
      active: true,
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/application13-12.firebasestorage.app/o/zero_chute.png?alt=media&token=24d26081-7d40-4474-94b5-9211b05cde80",
    },
  };

  const batch = writeBatch(db);

  Object.entries(cards).forEach(([id, data]) => {
    batch.set(doc(db, "cards", id), data, { merge: true });
  });

  await batch.commit();

  return Object.keys(cards).length;
}
