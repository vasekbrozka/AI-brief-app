# AIspresso — recept pro denní generování briefu

Tento soubor je **závazný recept**, podle kterého se každý den automaticky generuje nový
brief. Naplánovaná (cron) Claude session dostane jednoduchý pokyn:

> „Přečti si `docs/brief-generation.md` a přesně podle něj vygeneruj dnešní brief,
> pak commitni a pushni na produkční větev."

Ladění obsahu = úprava tohoto souboru. Časovač se nepředělává.

---

## Cíl

Krátký, **ověřený**, **dvojjazyčný** (CZ + EN) přehled nejdůležitějších novinek ze světa
AI za posledních ~24 hodin. Věcný tón, žádný hype, žádné spekulace.

## Postup

1. Zjisti **dnešní datum** ve formátu `YYYY-MM-DD` (UTC): `date -u +%F`.
2. **Přečti si briefy z posledních dnů** v `public/data/briefs/` (jsou v repu) —
   slouží k deduplikaci, viz redakční pravidlo 2.
3. Udělej **web rešerši** novinek za posledních ~24 h. Vždy se pokus pokrýt jádrová témata
   (pokud se u nich něco dělo): **Anthropic / Claude**, **OpenAI / ChatGPT**,
   **Google / Gemini**, **Microsoft 365 Copilot**. Doplň **1–3 velké obecné** zprávy
   (ostatní modely, coding agenti, regulace/EU, velký byznys — IPO/žaloby/akvizice,
   bezpečnost a výzkum).
4. Vyber zprávy podle **redakčních pravidel níže** (cíl 6–8, tichý den může mít méně).
   Označ právě **jednu** jako hlavní (`highlight: true`) — největší událost dne.
5. Ke každé zprávě:
   - `category`: jedna z `models` · `research` · `business` · `tools` · `policy` · `opensource`
   - `title` a `summary` **dvojjazyčně** (CZ i EN); shrnutí **~45 slov**
   - 1–3 `sources` s **reálnými URL** (podle tierů níže)
   - `verified` podle definice níže
   - **Žádný** řádek „proč to je důležité" — jen fakta.
6. Zapiš `public/data/briefs/<datum>.json` přesně podle schématu níže, `sample: false`.
7. Aktualizuj `public/data/briefs/index.json`: nastav `updated` na **aktuální čas
   generování** (`date -u +%Y-%m-%dT%H:%M:%SZ`) — appka ho zobrazuje jako „Aktualizováno" —
   přidej nový záznam **navrch**, nech jen **3 nejnovější dny** a **starší `.json` soubory smaž**.
8. **Zvaliduj**, že oba soubory jsou platný JSON (`JSON.parse`).
9. `git add -A` → `git commit -m "brief: <datum>"` → `git push` na produkční větev.
   Když push selže kvůli novým commitům na originu (non-fast-forward), udělej
   `git pull --rebase origin <větev>` a push zopakuj. (Netlify nasadí automaticky.)

---

## Redakční pravidla

### 1 · Tichý den (není nic nového)
- **Nikdy nepřidávej vatu.** Kvalita > počet: radši 3–5 kvalitních zpráv než 8 nafouknutých.
- Nejdřív rozšiř záběr: obecné AI dění, sousední témata, významná **pokračování**
  dřívějších událostí.
- Když je opravdu ticho, napiš to poctivě do `intro` (např. „Dnes bylo v AI klidněji —
  tady je to podstatné.") a dej méně zpráv. Nikdy si nevymýšlej.

### 2 · Duplicita s předchozími dny
- Před výběrem si přečti poslední 1–3 briefy v repu. **Stejnou zprávu neopakuj.**
- Výjimka = **nový vývoj** (včera „vyšlo X", dnes „X má výsledky / narazilo na problém"):
  zařaď, ale formuluj jako **update**, ne jako novou událost. Slug odliš
  (`...-update`, `...-results`).
- Stejná událost z více zdrojů = **jedna** položka s více zdroji.

### 3 · Přetlak (je toho moc)
- **Tvrdý strop 8 zpráv.** Přebytek se záměrně zahodí — kurátorský výběr je hodnota briefu.
- Priorita výběru:
  1. dopad na jádrová témata (Claude, OpenAI/ChatGPT, Gemini, M365 Copilot),
  2. velikost události (vydání modelu > malá funkce; miliardová akvizice > kolo série A),
  3. ověřené > neověřené,
  4. čerstvost (dnes > včera večer).
- Hlavní zpráva (`highlight`) = největší z vybraných.

### 4 · Protichůdné informace
- **Nikdy neprůměruj** rozporná čísla/fakta a nevymýšlej „střed".
- Přednost má **primární/oficiální zdroj** (co firma sama oznámila) před interpretací médií.
- Když se zdroje liší ve faktu: uveď ověřenou verzi a rozpor krátce zmiň
  („podle X…, Y ale uvádí…"), nebo nastav `verified: false`.
- Nepodložené drby s rozpornými verzemi radši **vynech**.

### 5 · Zdroje — tiery důvěryhodnosti

| Tier | Co to je | Role |
|------|----------|------|
| **1 — Primární / oficiální** | anthropic.com/news · openai.com/news · blog.google · deepmind.google · microsoft.com (blog) · learn.microsoft.com (release notes) · oficiální changelogy a tiskové zprávy · SEC/soudní dokumenty | Primární pravda o tom, co firma oznámila |
| **2 — Reputabilní média** | Reuters · AP · Bloomberg · The Verge · Ars Technica · TechCrunch · Axios · The Information · Wired · CNBC · FT · WSJ · The Register · MIT Technology Review | Ověření a kontext |
| **3 — Doplňkové** | agregátory (např. Releasebot) · Hacker News · Reddit · GitHub · specializované blogy · arXiv/preprinty | Jen k **objevení** tématu — samy o sobě nikdy nestačí na „ověřeno" |

**Nepoužívej:** neznámé blogy, obsahové farmy / SEO weby, sociální sítě bez potvrzení,
anonymní „leak" účty.

### Definice `verified: true`
Zpráva je ověřená, **jen** když je potvrzená **≥2 nezávislými zdroji**, z toho alespoň
jeden **Tier 1 nebo Tier 2**. Ideál: 1× oficiální (T1) + 1× médium (T2), nebo 2× nezávislé
médium (T2). „Nezávislé" znamená, že nejde o dvě média přepisující tutéž tiskovou zprávu —
to se počítá jako jeden zdroj informace.

`verified: false` nastav, když: jediný zdroj · pouze Tier 3 · preprint · „chystá se" /
únik / rumor · nevyřešený rozpor mezi zdroji.

---

## Schéma — `public/data/briefs/<datum>.json`

```jsonc
{
  "date": "YYYY-MM-DD",
  "sample": false,
  "headline": { "cs": "...", "en": "..." },   // krátký titulek dne
  "intro":    { "cs": "...", "en": "..." },    // 1–2 věty souhrn dne
  "items": [
    {
      "id": "YYYY-MM-DD-kratky-slug",
      "category": "models",
      "highlight": true,                        // jen u JEDNÉ zprávy, jinak vynech
      "verified": true,
      "title":   { "cs": "...", "en": "..." },
      "summary": { "cs": "...", "en": "..." },  // ~45 slov
      "sources": [ { "name": "The Verge", "url": "https://www.theverge.com/..." } ]
    }
  ]
}
```

## Schéma — `public/data/briefs/index.json`

```jsonc
{
  "updated": "ISO-8601 timestamp",
  "briefs": [                                   // max 3, nejnovější první
    { "date": "YYYY-MM-DD", "headline": { "cs": "...", "en": "..." }, "itemCount": 8 }
  ]
}
```

## Guardrails

- **Nikdy si nevymýšlej fakta ani URL.** Každá zpráva musí mít dohledatelný zdroj.
- Drž se schématu 1:1 (klíče, kategorie, dvojjazyčnost).
- Tón: věcný, jako když ti to shrne chytrý kolega. Žádný marketing.
- Když rešerše nebo push selže, jasně to ohlas a **nezanechávej rozbitý JSON**.

## Časování

- Spouští se **1× denně v 03:00 UTC** (05:00 CEST v létě / 04:00 CET v zimě).
- To je po skončení amerického pracovního dne → ranní brief obsahuje i čerstvé US novinky.
