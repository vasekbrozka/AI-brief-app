# AIspresso

**AI + espresso** — tvůj každodenní šálek novinek ze světa AI. Osobní webová appka (PWA),
která na jednom místě zobrazuje krátký, přehledný a ověřený denní přehled. Na iPhonu jde
přes Safari přidat na plochu a chová se jako nativní aplikace — celoobrazovkově, s vlastní
ikonou a s podporou offline.

> **Fáze 1 (tato verze):** hotové UI, funkce a kostra appky s **ukázkovým obsahem**.
> **Fáze 2 (další krok):** automatický denní crawl novinek pomocí AI, který bude obsah generovat.

## Co appka umí

- 📱 **PWA** — přidání na plochu iPhonu, celoobrazovkový režim, funguje offline (service worker)
- 🌗 **Světlý / tmavý / automatický** motiv ve stylu Apple
- 🇨🇿 🇬🇧 **Dvojjazyčně** — přepínač CS / EN v Nastavení
- 🗂️ **Tři obrazovky** — Dnes, Archiv (poslední 3 dny), Nastavení
- ✅ **Ověřování** — u každé zprávy zdroje a odznak „Ověřeno", filtrování podle kategorie
- ✔️ **Přečteno** — odškrtnutí zprávy ji zprůhlední a sesune dolů; přečtené lze i skrýt

## Vývoj lokálně

```bash
npm install        # instalace závislostí
npm run dev        # vývojový server (http://localhost:5173)
npm run build      # produkční build do dist/
npm run preview    # náhled produkčního buildu
npm run typecheck  # kontrola typů
npm run icons      # znovu vygeneruje PWA ikony z jiskry (scripts/generate-icons.mjs)
```

## Obsah (briefy)

Obsah se načítá za běhu ze statických JSON souborů — díky tomu je fáze 2 (AI crawl)
jen otázkou zapisování stejných souborů:

```
public/data/briefs/
├── index.json          # seznam dostupných briefů (nejnovější první)
└── YYYY-MM-DD.json      # jeden brief na den
```

Datový model najdeš v `src/lib/types.ts`. Každá zpráva má kategorii, dvojjazyčný titulek
a shrnutí, seznam zdrojů a příznak `verified`. Přidání nového dne = přidat `YYYY-MM-DD.json`
a zapsat ho do `index.json`.

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
├── lib/                     # typy, načítání briefů, formátování, kategorie
├── providers/               # kontext jazyka a motivu
├── hooks/                   # načítání dat (index, brief, nejnovější)
├── components/              # tab bar, navbar, karty, chipy, stavy…
└── screens/                 # Dnes, Archiv, Detail briefu, Nastavení
```

## Technologie

Vite · React · TypeScript · vite-plugin-pwa · ručně psané CSS (bez UI knihovny) · Netlify
