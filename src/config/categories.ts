/**
 * Configuration and metadata for Live TV categories available on Kool.ws
 */

export interface LiveCategory {
  id: string;
  name: string;
  flag: string;
  description: string;
}

export const LIVE_CATEGORIES: LiveCategory[] = [
  { id: "France", name: "France", flag: "🇫🇷", description: "TNT, Généralistes, Cinéma, Découverte" },
  { id: "France Sport", name: "France Sport", flag: "⚽", description: "DAZN, beIN Sports, Canal+ Sport..." },
  { id: "United Kingdom", name: "Royaume-Uni", flag: "🇬🇧", description: "BBC, ITV, Sky UK, BT Sport..." },
  { id: "Germany", name: "Allemagne", flag: "🇩🇪", description: "ARD, ZDF, Sky Deutschland, RTL..." },
  { id: "Spain", name: "Espagne", flag: "🇪🇸", description: "Movistar, LaLiga, Telecinco..." },
  { id: "Italy", name: "Italie", flag: "🇮🇹", description: "Rai, Sky Italia, Mediaset..." },
  { id: "Portugal", name: "Portugal", flag: "🇵🇹", description: "Sport TV, RTP, SIC, TVI..." },
  { id: "Netherlands", name: "Pays-Bas", flag: "🇳🇱", description: "Ziggo, NOS, RTL Nederland..." },
  { id: "Poland", name: "Pologne", flag: "🇵🇱", description: "Canal+ Polska, Polsat, TVP..." },
  { id: "Turkey", name: "Turquie", flag: "🇹🇷", description: "beIN Sports TR, TRT, ATV..." },
  { id: "Arabia", name: "Pays Arabes", flag: "🇸🇦", description: "beIN Mena, MBC, OSN, Al Jazeera..." },
  { id: "Russia", name: "Russie", flag: "🇷🇺", description: "Match TV, Channel One, Rossiya..." },
  { id: "Balkans", name: "Balkans", flag: "🇧🇦", description: "Arena Sport, Nova, SportKlub..." },
  { id: "Croatia", name: "Croatie", flag: "🇭🇷", description: "HRT, Nova TV, RTL Hrvatska..." },
  { id: "Albania", name: "Albanie", flag: "🇦🇱", description: "SuperSport AL, Top Channel, RTSH..." },
  { id: "Bulgaria", name: "Bulgarie", flag: "🇧🇬", description: "Diema Sport, bTV, Nova..." },
  { id: "Romania", name: "Roumanie", flag: "🇷🇴", description: "Digi Sport, Pro TV, Antena..." }
];

export const ALL_CATEGORY_IDS = LIVE_CATEGORIES.map((c) => c.id);

export const COUNTRY_FLAGS: Record<string, string> = {
  "France": "https://flagcdn.com/w320/fr.png",
  "France Sport": "https://flagcdn.com/w320/fr.png",
  "Germany": "https://flagcdn.com/w320/de.png",
  "United Kingdom": "https://flagcdn.com/w320/gb.png",
  "Spain": "https://flagcdn.com/w320/es.png",
  "Italy": "https://flagcdn.com/w320/it.png",
  "Portugal": "https://flagcdn.com/w320/pt.png",
  "Netherlands": "https://flagcdn.com/w320/nl.png",
  "Poland": "https://flagcdn.com/w320/pl.png",
  "Russia": "https://flagcdn.com/w320/ru.png",
  "Turkey": "https://flagcdn.com/w320/tr.png",
  "Arabia": "https://flagcdn.com/w320/sa.png",
  "Albania": "https://flagcdn.com/w320/al.png",
  "Croatia": "https://flagcdn.com/w320/hr.png",
  "Bulgaria": "https://flagcdn.com/w320/bg.png",
  "Romania": "https://flagcdn.com/w320/ro.png",
  "Balkans": "https://flagcdn.com/w320/ba.png"
};
