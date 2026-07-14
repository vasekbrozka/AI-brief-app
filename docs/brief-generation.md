# AIspresso — recept pro denní generování briefu

Tento soubor je „recept", podle kterého se **každý den automaticky generuje nový brief**.
Naplánovaná (cron) Claude session dostane jednoduchý pokyn:

> „Přečti si `docs/brief-generation.md` a přesně podle něj vygeneruj dnešní brief,
> pak commitni a pushni na produkční větev."

Ladění obsahu = úprava tohoto souboru. Časovač se nepředělává.

---

## Cíl

Krátký, **ověřený**, **dvojjazyčný** (CZ + EN) přehled nejdůležitějších novinek ze světa
AI za posledních ~24 hodin. Věcný tón, žádný hype, žádné spekulace.

## Postup

1. Zjisti **dnešní datum** ve formátu `YYYY-MM-DD` (UTC).
2. Udělej **web rešerši** novinek za posledních ~24 h. Vždy se pokus pokrýt jádrová témata
   (pokud se u nich něco dělo): **Anthropic / Claude**, **OpenAI / ChatGPT**,
   **Google / Gemini**, **Microsoft 365 Copilot**. Doplň **1–3 velké obecné** zprávy
   (ostatní modely, coding agenti, regulace/EU, velký byznys — IPO/žaloby/akvizice,
   bezpečnost a výzkum).
3. Preferuj **primární zdroje** (oficiální blogy a release notes: anthropic.com/news,
   openai.com/news, blog.google, microsoft.com/blog + Learn). Ověřuj přes reputabilní
   média: TechCrunch, The Verge, Ars Technica, Axios, Reuters, The Register.
4. Vyber **6–8 zpráv**. **Dedupikuj** (stejná zpráva z více zdrojů = jedna položka
   s více zdroji). Označ právě **jednu** jako hlavní (`highlight: true`).
5. Ke každé zprávě:
   - `category`: jedna z `models` · `research` · `business` · `tools` · `policy` · `opensource`
   - `title` a `summary` **dvojjazyčně** (CZ i EN); shrnutí **~45 slov**
   - 1–3 `sources` s **reálnými URL**
   - `verified: true` **jen** když je zpráva potvrzená ≥2 nezávislými zdroji
     (nebo oficiální primární zdroj + 1 médium); jinak `false`
   - **Žádný** řádek „proč to je důležité" — jen fakta.
6. Zapiš `public/data/briefs/<datum>.json` přesně podle schématu níže, `sample: false`.
7. Aktualizuj `public/data/briefs/index.json`: přidej nový záznam **navrch**, nech jen
   **3 nejnovější dny** a **starší `.json` soubory smaž**.
8. **Zvaliduj**, že oba soubory jsou platný JSON (`JSON.parse`).
9. `git add` → `git commit -m "brief: <datum>"` → `git push` na produkční větev.
   (Netlify nasadí automaticky.)

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

## Pravidla (guardrails)

- **Nikdy si nevymýšlej fakta ani URL.** Každá zpráva musí mít dohledatelný zdroj.
- Nepotvrzené (jediný zdroj, preprint, únik, „chystá se") → `verified: false`.
- Když se u některého jádrového tématu za 24 h nic velkého nestalo, **nevymýšlej** —
  radši dej silnější obecnou zprávu.
- Drž se schématu 1:1 (klíče, kategorie, dvojjazyčnost).
- Tón: věcný, jako když ti to shrne chytrý kolega. Žádný marketing.

## Časování

- Spouští se **1× denně v 03:00 UTC** (05:00 CEST v létě / 04:00 CET v zimě).
- To je po skončení amerického pracovního dne → ranní brief obsahuje i čerstvé US novinky.
