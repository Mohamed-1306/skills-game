// src/logic/seedCards.js
import { doc, writeBatch } from "firebase/firestore";

const BASE = "https://raw.githubusercontent.com/Mohamed-1306/skills-game/master/public/cards";

export async function seedCards(db) {
  const cards = {
    apporte_ton_aide: {
      title: "APPORTE TON AIDE",
      type: "bonne_conduite",
      duration: "journee",
      points: 250,
      active: true,
      imageUrl: `${BASE}/apporte_ton_aide.jpg`,
    },
    bonjour_equipes_domaine: {
      title: "BONJOUR EQUIPES DOMAINE",
      type: "bonne_conduite",
      duration: "journee",
      points: 250,
      active: true,
      imageUrl: `${BASE}/bonjour_equipes_domaine.jpg`,
    },
    dire_merci_pisteurs: {
      title: "DIRE MERCI A DES PISTEURS",
      type: "bonne_conduite",
      duration: "demi_journee",
      points: 250,
      active: true,
      imageUrl: `${BASE}/dire_merci_pisteurs.jpg`,
    },
    laisse_passer_2_remontees: {
      title: "LAISSE PASSER 2 PERSONNES A CHAQUE REMONTEES",
      type: "contrainte",
      duration: "demi_journee",
      points: 350,
      active: true,
      imageUrl: `${BASE}/laisse_passer_2_remontees.jpg`,
    },
    limite_vitesse_50: {
      title: "LIMITE DE VITESSE 50",
      type: "contrainte",
      duration: "demi_journee",
      points: 350,
      active: true,
      imageUrl: `${BASE}/limite_vitesse_50.jpg`,
    },
    materiel_securite: {
      title: "EMPORTE LE MATERIEL DE SECURITE",
      type: "challenge",
      duration: "journee",
      points: 200,
      active: true,
      imageUrl: `${BASE}/materiel_securite.jpg`,
    },
    ne_fume_pas: {
      title: "NE FUME PAS",
      type: "bonne_conduite",
      duration: "demi_journee",
      points: 250,
      active: true,
      imageUrl: `${BASE}/ne_fume_pas.jpg`,
    },
    organise: {
      title: "ORGANISE",
      type: "challenge",
      duration: "journee",
      points: 200,
      active: true,
      imageUrl: `${BASE}/organise.jpg`,
    },
    paie_l_addition: {
      title: "PAIE L ADDITION",
      type: "challenge",
      duration: "midi",
      points: 200,
      active: true,
      imageUrl: `${BASE}/paie_l_addition.jpg`,
    },
    porteur: {
      title: "PORTEUR",
      type: "contrainte",
      duration: "journee",
      points: 350,
      active: true,
      imageUrl: `${BASE}/porteur.jpg`,
    },
    ramasse_dechets: {
      title: "RAMASSE DES DECHETS",
      type: "bonne_conduite",
      duration: "journee",
      points: 250,
      active: true,
      imageUrl: `${BASE}/ramasse_dechets.jpg`,
    },
    reste_derriere_moi: {
      title: "RESTE DERRIERE MOI",
      type: "contrainte",
      duration: "journee",
      points: 350,
      active: true,
      imageUrl: `${BASE}/reste_derriere_moi.jpg`,
    },
    zero_alcool_pistes: {
      title: "PAS D ALCOOL SUR LES PISTES",
      type: "contrainte",
      duration: "journee",
      points: 350,
      active: true,
      imageUrl: `${BASE}/zero_alcool_pistes.jpg`,
    },
    zero_arret_descente: {
      title: "0 ARRET SUR UNE DESCENTE",
      type: "challenge",
      duration: "demi_journee",
      points: 200,
      active: true,
      imageUrl: `${BASE}/zero_arret_descente.jpg`,
    },
    zero_chute: {
      title: "0 CHUTE",
      type: "challenge",
      duration: "journee",
      points: 200,
      active: true,
      imageUrl: `${BASE}/zero_chute.jpg`,
    },
  };

  const batch = writeBatch(db);
  Object.entries(cards).forEach(([id, data]) => {
    batch.set(doc(db, "cards", id), data, { merge: true });
  });
  await batch.commit();
  return Object.keys(cards).length;
}