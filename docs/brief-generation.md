# AIspresso — recept pro denní generování briefu

Tento soubor je **závazný recept**, podle kterého se každý den automaticky generuje nový
brief. Naplánovaná (cron) Claude session dostane jednoduchý pokyn:

> „Přečti si `docs/brief-generation.md` a přesně podle něj vygeneruj dnešní brief,
> pak commitni a pushni na produkční větev."

Ladění obsahu = úprava tohoto souboru. Časovač se nepředělává.

**Poznámka k architektuře:** appka briefy nenačítá z Netlify, ale přímo z GitHubu
(`src/lib/briefs.ts`, GitHub Contents API). Commit, který mění **jen** `data/briefs/`,
proto Netlify záměrně **automaticky přeskočí** (`ignore` v `netlify.toml`) — je to
správné chování, ne chyba, a šetří to nasazovací kredity. Pokud commit vedle dat
mění i cokoliv jiného (kód, `netlify.toml`…), Netlify normálně nasadí.

---

## Cíl

Krátký, **ověřený**, **dvojjazyčný** (CZ + EN) přehled nejdůležitějších novinek ze světa
AI za posledních ~24 hodin. Věcný tón, žádný hype, žádné spekulace.

## Postup

1. Zjisti **dnešní datum** ve formátu `YYYY-MM-DD` (UTC): `date -u +%F`.
2. **Přečti si briefy z posledních dnů** v `data/briefs/` (jsou v repu) —
   slouží k deduplikaci, viz redakční pravidlo 2.
3. Udělej **rešerši** novinek za posledních ~24 h, ve třech fázích (od nejdůvěryhodnějšího):

   **3a · Kánon zdrojů (primární).** Udělej 2–4 cílené WebSearch dotazy omezené přes
   `allowed_domains` na kanonické domény, ať kandidáti pocházejí rovnou od zdroje,
   ne z agregátorů:
   - oficiální (Tier 1): `anthropic.com`, `openai.com`, `blog.google`, `deepmind.google`,
     `microsoft.com`, `learn.microsoft.com`, `nvidia.com`, `ai.meta.com`,
     `huggingface.co`, `mistral.ai`
   - média (Tier 2): `theverge.com`, `arstechnica.com`, `techcrunch.com`, `reuters.com`,
     `apnews.com`, `bloomberg.com`, `wired.com`, `theregister.com`,
     `technologyreview.com`, `axios.com`, `cnbc.com`
   Vždy se pokus pokrýt jádrová témata (pokud se u nich něco dělo): **Anthropic / Claude**,
   **OpenAI / ChatGPT**, **Google / Gemini**, **Microsoft 365 Copilot**.

   **3b · RSS feed M365 (bonus).** Jediný feed průchozí zdejší sítí — stáhni ho curlem
   pro přesné pokrytí Microsoft 365 Copilot novinek:
   `curl -sS --max-time 12 "https://www.microsoft.com/en-us/microsoft-365/blog/feed/" | head -c 100000`
   Když selže, pokračuj bez něj (pokryje ho 3a).

   **3c · Široký web search (doplněk).** Neomezené dotazy na 1–3 velké obecné zprávy
   (ostatní modely, coding agenti, regulace/EU, velký byznys — IPO/žaloby/akvizice,
   bezpečnost a výzkum) a na **křížové ověřování** kandidátů z 3a/3b.

   ⚠️ Síťová poznámka: přímé stahování stránek a RSS feedů (curl/WebFetch) je zdejší
   síťovou politikou **zablokované pro většinu domén** (CONNECT 403) — výjimkou je
   microsoft.com výše. Neztrácej čas opakovanými pokusy; rešerši dělej přes WebSearch.
4. Vyber zprávy podle **redakčních pravidel níže** (cíl 6–10, tichý den může mít méně).
   Označ právě **jednu** jako hlavní (`highlight: true`) — největší událost dne.
5. Ke každé zprávě:
   - `category`: jedna z `models` · `research` · `business` · `tools` · `policy` · `opensource`
   - `title` a `summary` **dvojjazyčně** (CZ i EN); shrnutí **~45 slov**
   - 1–3 `sources` s **reálnými URL** (podle tierů níže)
   - `verified` podle definice níže
   - **Žádný** řádek „proč to je důležité" — jen fakta.
6. Zapiš `data/briefs/<datum>.json` přesně podle schématu níže, `sample: false`.
7. Aktualizuj `data/briefs/index.json`: nastav `updated` na **aktuální čas
   generování** (`date -u +%Y-%m-%dT%H:%M:%SZ`) — appka ho zobrazuje jako „Aktualizováno" —
   přidej nový záznam **navrch**, nech jen **3 nejnovější dny** a **starší denní soubory
   `YYYY-MM-DD.json` smaž** (soubor `tips-backlog.json` NEMAŽ — je to trvalý backlog tipů).
8. **Zvaliduj**, že oba soubory jsou platný JSON (`JSON.parse`).
9. `git add -A` → `git commit -m "brief: <datum>"` → `git push` na produkční větev.
   Když push selže kvůli novým commitům na originu (non-fast-forward), udělej
   `git pull --rebase origin <větev>` a push zopakuj. Netlify tento push **záměrně
   nenasadí** (viz poznámka k architektuře výše) — appka nová data uvidí přímo
   z GitHubu do minuty, žádný deploy není potřeba.

---

## Redakční pravidla

### 1 · Tichý den (není nic nového)
- **Nikdy nepřidávej vatu.** Kvalita > počet: radši 3–5 kvalitních zpráv než 8 nafouknutých.
- Nejdřív rozšiř záběr: obecné AI dění, sousední témata, významná **pokračování**
  dřívějších událostí.
- **Doplň tipy (evergreen novinky) z backlogu.** Když je čerstvých 24h zpráv málo, doplň brief
  „tipy" — užitečné, ale ne nutně horké funkce napříč jádrovými nástroji (Claude, ChatGPT,
  Gemini, M365 Copilot) z **posledních ~30 dní**. Bereš je z fronty v `tips-backlog.json`
  (viz pravidlo 2).
  - **Kolik:** doplň tak, aby brief měl aspoň ~5 položek. **Počet tipů = 5 − počet čerstvých
    zpráv, strop 3** (0–2 zprávy → 3 tipy · 3 → 2 · 4 → 1 · 5+ → 0 — do bohatého dne tipy nepatří).
  - Tip má id `<datum>-tip-<slug>` a v `summary` **poctivě uveď, že nejde o dnešní novinku**
    (např. „Microsoft to nasadil v červnu…") — nikdy tip nevydávej za breaking news.
  - Tipy z **oficiálních release notes / first-party** (Tier 1) jsou `verified: true` — je to
    primární pravda výrobce o vlastním produktu.
  - Tip **není nikdy** hlavní zpráva (`highlight`) — highlight je vždy skutečná zpráva dne.
  - V `intro` klidný den s tipy poctivě přiznej („Klidný den doplňujeme tipy z posledních týdnů.").
- Když je i s tipy opravdu ticho, napiš to poctivě do `intro` a dej méně zpráv. Nikdy si nevymýšlej.

### 2 · Duplicita s předchozími dny
- Před výběrem si přečti poslední 1–3 briefy v repu. **Stejnou zprávu neopakuj.**
- Výjimka = **nový vývoj** (včera „vyšlo X", dnes „X má výsledky / narazilo na problém"):
  zařaď, ale formuluj jako **update**, ne jako novou událost. Slug odliš
  (`...-update`, `...-results`).
- Stejná událost z více zdrojů = **jedna** položka s více zdroji.
- **Tipy — backlog.** Kandidáti i historie tipů žijí v `data/briefs/tips-backlog.json`
  (appka ho nečte). Pole `tips[]`, každý má `used`: `null` = čeká ve frontě, `"YYYY-MM-DD"` =
  už zveřejněno. Práce s ním:
  - **Bank:** když při rešerši (i v rušný den) narazíš na dobrou evergreen funkci, přidej ji do
    backlogu jako `used: null` — pokud tam slug ještě není. Fronta se tím plní do zásoby.
  - **Publish:** v tichý den ber tipy z fronty (`used: null`), nejstarší `added` první; po
    zveřejnění (zkopíruj do briefu s id `<datum>-<slug>`) jim v backlogu nastav `used` na dnešek.
  - **Prune:** použité (`used`) starší ~60 dní zahoď; nepoužité kandidáty starší ~90 dní taky.

### 3 · Přetlak (je toho moc)
- **Tvrdý strop 10 zpráv.** Přebytek se záměrně zahodí — kurátorský výběr je hodnota briefu.
- Priorita výběru:
  1. **přímý užitek pro uživatele** — nové funkce, produkty, modely a nástroje, které si
     člověk může vyzkoušet; přednost mají jádrová témata (Claude, OpenAI/ChatGPT, Gemini,
     M365 Copilot),
  2. velikost události (vydání modelu > malá funkce; miliardová akvizice > kolo série A),
  3. ověřené > neověřené,
  4. čerstvost (dnes > včera večer).
- **Vyváženost:** brief čte uživatel, ne investor. Zprávy o funkcích, produktech a modelech
  mají tvořit většinu (~⅔ briefu); čistý byznys (financování, akvizice, žaloby, kvartální
  čísla) drž zhruba na třetině. Mimořádná byznys událost dne se samozřejmě vejde — klidně
  i jako highlight — ale tři fundraisingové zprávy v jednom briefu ne.
- Hlavní zpráva (`highlight`) = největší z vybraných; při rovnosti vyhrává ta, která se
  uživatelů dotkne přímo.

### 4 · Protichůdné informace
- **Nikdy neprůměruj** rozporná čísla/fakta a nevymýšlej „střed".
- Přednost má **primární/oficiální zdroj** (co firma sama oznámila) před interpretací médií.
- Když se zdroje liší ve faktu: uveď ověřenou verzi a rozpor krátce zmiň
  („podle X…, Y ale uvádí…"), nebo nastav `verified: false`.
- Nepodložené drby s rozpornými verzemi radši **vynech**.

### 5 · Zdroje — tiery důvěryhodnosti

| Tier | Co to je | Role |
|------|----------|------|
| **1 — Primární / oficiální** | anthropic.com/news · openai.com/news · blog.google · deepmind.google · microsoft.com (blog) · learn.microsoft.com (release notes) · nvidianews.nvidia.com · ai.meta.com · huggingface.co (blog) · mistral.ai · oficiální changelogy a tiskové zprávy · SEC/soudní dokumenty | Primární pravda o tom, co firma oznámila |
| **2 — Reputabilní média** | Reuters · AP · Bloomberg · The Verge · Ars Technica · TechCrunch · Axios · The Information · Wired · CNBC · FT · WSJ · The Register · MIT Technology Review | Ověření a kontext |
| **3 — Doplňkové** | agregátory (např. Releasebot) · Hacker News · Reddit · GitHub · specializované blogy · arXiv/preprinty | Jen k **objevení** tématu — samy o sobě nikdy nestačí na „ověřeno" |

**Nepoužívej:** neznámé blogy, obsahové farmy / SEO weby, sociální sítě bez potvrzení,
anonymní „leak" účty.

**Do `sources` u zprávy piš vždy jen Tier 1/2 URL.** Tier 3 (agregátory, HN, denní
přehledové blogy) nikdy necituj jako zdroj — slouží jen k objevení tématu; skutečný
zdroj pak dohledej a ověř na Tier 1/2.

**Paywallové zdroje (Bloomberg, FT, WSJ, The Information) cituj jen v páru s volně
čitelným zdrojem** — čtenář musí mít vždy aspoň jeden odkaz, který si otevře bez
předplatného.

### Definice `verified: true`
Zpráva je ověřená, **jen** když je potvrzená **≥2 nezávislými zdroji**, z toho alespoň
jeden **Tier 1 nebo Tier 2**. Ideál: 1× oficiální (T1) + 1× médium (T2), nebo 2× nezávislé
médium (T2). „Nezávislé" znamená, že nejde o dvě média přepisující tutéž tiskovou zprávu —
to se počítá jako jeden zdroj informace.

`verified: false` nastav, když: jediný zdroj · pouze Tier 3 · preprint · „chystá se" /
únik / rumor · nevyřešený rozpor mezi zdroji.

---

## Schéma — `data/briefs/<datum>.json`

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

## Schéma — `data/briefs/index.json`

```jsonc
{
  "updated": "ISO-8601 timestamp",
  "briefs": [                                   // max 3, nejnovější první
    { "date": "YYYY-MM-DD", "headline": { "cs": "...", "en": "..." }, "itemCount": 8 }
  ]
}
```

## Schéma — `data/briefs/tips-backlog.json` (fronta + historie tipů; appka ho NEČTE)

```jsonc
{
  "tips": [
    {
      "slug": "tip-claude-cowork-web-mobile",   // bez datumu, stabilní klíč
      "category": "tools",
      "verified": true,
      "title":   { "cs": "...", "en": "..." },
      "summary": { "cs": "...", "en": "..." },   // ~35 slov, poctivé rámování
      "sources": [ { "name": "Anthropic", "url": "https://..." } ],
      "added": "2026-07-16",                     // kdy objeveno
      "used":  null                              // null = ve frontě, "YYYY-MM-DD" = zveřejněno
    }
  ]
}
```

## Guardrails

- **Nikdy si nevymýšlej fakta ani URL.** Každá zpráva musí mít dohledatelný zdroj.
- **Nehádej dny v týdnu.** Mapování datum→den si jazykový model plete. Appka už u každého
  briefu ukazuje celé datum, takže v `intro`, `headline`, `title` i `summary` **nepiš názvy
  dnů** (pondělí, úterý…). Použij konkrétní datum („17. července") nebo relativní výraz
  vztažený k dnešku („za posledních 24 h", „včera", „dnes"). Když den v týdnu opravdu
  potřebuješ, **spočítej** ho příkazem (`date -u -d 2026-07-17 +%A`), nikdy neodhaduj.
- Drž se schématu 1:1 (klíče, kategorie, dvojjazyčnost).
- Tón: věcný, jako když ti to shrne chytrý kolega. Žádný marketing.
- Když rešerše nebo push selže, jasně to ohlas a **nezanechávej rozbitý JSON**.

## Časování

- Spouští se **1× denně v 03:00 UTC** (05:00 CEST v létě / 04:00 CET v zimě).
- To je po skončení amerického pracovního dne → ranní brief obsahuje i čerstvé US novinky.
