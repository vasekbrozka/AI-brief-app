# AIspresso

**AI + espresso** — tvůj každodenní šálek novinek ze světa AI. Osobní webová appka (PWA),
která na jednom místě zobrazuje krátký, přehledný a ověřený denní přehled. Na iPhonu jde
přes Safari přidat na plochu a chová se jako nativní aplikace — celoobrazovkově, s vlastní
ikonou a s podporou offline.

Obsah každý den ráno generuje naplánovaná Claude session podle receptu v
`docs/brief-generation.md` (v3, září 2026) a commituje ho do repa; appka ho čte přímo
z GitHubu.

## Co appka umí

- 📱 **PWA** — přidání na plochu iPhonu, celoobrazovkový režim, funguje offline (service worker)
- 🌗 **Světlý / tmavý / automatický** motiv ve stylu Apple
- 🇨🇿 🇬🇧 **Dvojjazyčně** — přepínač CS / EN v Nastavení
- 🗂️ **Tři obrazovky** — Dnes, Archiv (poslední dva týdny + Uložené), Nastavení
- ✅ **Ověřování** — u každé zprávy zdroje, datum události a odznak „Ověřeno"
  (oficiální zdroj, nebo dvě nezávislá média)
- 💡 **Proč na tom záleží** — u každé zprávy věta dvě, co z ní plyne pro čtenáře;
  u tipů návod, kde funkci najít
- 📅 **Na obzoru** — nadcházející termíny (vydání, konference, lhůty, soudy)
- 🗓️ **Týden v AI** — nedělní ohlédnutí za událostmi týdne s odkazy do archivu
- ✔️ **Přečteno**, uložení na později, sdílení novinky i celého přehledu, série čtení,
  vysvětlivky pojmů (slovníček roste s obsahem), ranní upozornění s titulkem dne

## Vývoj lokálně

```bash
npm install        # instalace závislostí
npm run dev        # vývojový server (http://localhost:5173)
npm run build      # produkční build do dist/
npm run preview    # náhled produkčního buildu
npm run typecheck  # kontrola typů
npm run icons      # přegeneruje PWA ikony z assets/icon-source.png (scripts/generate-icons.mjs)
```

## Obsah (briefy)

Obsah se načítá za běhu jako statický JSON:

```
data/
├── glossary.json            # slovníček pojmů (appka podtrhává a vysvětluje)
└── briefs/
    ├── index.json           # seznam dostupných briefů (nejnovější první, 14 dnů)
    ├── YYYY-MM-DD.json      # jeden brief na den (starší dny zůstávají, jen nejsou v indexu)
    ├── published-log.json   # ledger zveřejněných položek (dedup, 60 dní) — appka nečte
    └── tips-backlog.json    # fronta tipů k vyzkoušení — appka nečte
```

Appka (`src/lib/briefs.ts`) je čte přímo z GitHubu (raw + Contents API jako záloha),
ne z Netlify — daily commit do `data/` proto Netlify záměrně nenasazuje (`ignore`
v `netlify.toml`), aby denní obsah nestál nasazovací kredity.

Datový model je v `src/lib/types.ts`. Každá položka má `kind` (zpráva / tip), kategorii,
dvojjazyčný titulek, shrnutí a **`why`** (proč na tom záleží), **`eventDate`**, seznam
zdrojů a příznak `verified`; brief má navíc **`radar`** s nadcházejícími termíny a
v neděli **`weekInReview`** s událostmi týdne. Pole z v3 jsou volitelná, starší briefy
se vykreslí beze změny.

- Recept pro generování: `docs/brief-generation.md`
- Kontrola před publikací: `python3 docs/check-brief.py` (schéma, meze, zdroje, ledgery,
  slovníček); `--stats` vypíše čísla za posledních 14 dnů
- Ukázka briefu v3: `docs/examples/brief-v3-example.json`
- Analýza, ze které v3 vzešla: `docs/analyza-receptu-2026-09.md`

## Nasazení na Netlify

Repozitář obsahuje `netlify.toml`, takže stačí:

1. V Netlify propojit tento GitHub repozitář (**Add new site → Import**).
2. Build i publish adresář se načtou automaticky (`npm run build`, `dist`).
3. Po nasazení připojit vlastní doménu (**Domain settings**).

Případně jde nahrát ručně: `npm run build` a přetáhnout složku `dist/` do Netlify.

## Přidání na plochu iPhonu

1. Otevřít web v **Safari**.
2. Klepnout na **Sdílet** (čtvereček se šipkou nahoru).
3. Vybrat **Přidat na plochu**.

## Struktura projektu

```
src/
├── main.tsx                 # vstupní bod + registrace service workeru
├── App.tsx                  # navigace mezi obrazovkami
├── index.css                # design systém (tokeny, motivy, komponenty)
├── i18n/strings.ts          # texty rozhraní CS / EN
├── lib/                     # typy, načítání briefů, formátování, kategorie, archiv
├── providers/               # nastavení, přečteno, uložené, série, slovníček
├── hooks/                   # načítání dat (index, brief, nejnovější)
├── components/              # tab bar, navbar, karty, radar, chipy, stavy…
└── screens/                 # Dnes, Archiv, Detail briefu, Uložené, Nastavení, O aplikaci
```

## Technologie

Vite · React · TypeScript · vite-plugin-pwa · ručně psané CSS (bez UI knihovny) · Netlify
