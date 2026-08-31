# AIspresso — recept pro denní generování briefu (v2)

Tento soubor je **závazný recept**, podle kterého se každý den automaticky generuje nový
brief. Naplánovaná (cron) Claude session dostane jednoduchý pokyn:

> „Přečti si `docs/brief-generation.md` a přesně podle něj vygeneruj dnešní brief,
> pak commitni a pushni na produkční větev."

Ladění obsahu = úprava tohoto souboru. Časovač se nepředělává. Recept je psaný tak, aby
podle něj konzistentně pracoval i konzervativní model: **kde jde rozhodnutí nahradit
kontrolou nebo příkazem, udělej to.**

**Architektura:** appka čte briefy přímo z GitHubu (`src/lib/briefs.ts`), ne z Netlify.
Commit měnící jen `data/briefs/` a/nebo `docs/` Netlify **záměrně přeskočí** (`ignore`
pravidlo) — přeskočený deploy je správné chování, ne chyba. Denní obsah je tedy zdarma.

---

## Cíl

Krátký, **ověřený**, **dvojjazyčný** (CZ + EN) přehled nejdůležitějších novinek ze světa
AI za posledních ~72 hodin, doplněný v klidné dny užitečnými tipy. Věcný tón, žádný hype,
žádné spekulace. **Relevance a spolehlivost obsahu je jediný smysl appky** — radši méně
a pravdivě než více a přibližně.

---

## Pipeline

### 0 · Příprava

1. `cd /home/user/AI-brief-app` a aktualizuj repo
   (`git pull --rebase --autostash origin claude/daily-ai-brief-app-b1qq0p`).
2. Dnešní datum (UTC): `date -u +%F`. Pokud `data/briefs/<dnešek>.json` už existuje a je
   platný JSON, brief je hotový — nic negeneruj a skonči.
3. Přečti si redakční stav:
   - poslední briefy `data/briefs/*.json` (okno 7 dnů),
   - `data/briefs/published-log.json` — zveřejněné zprávy za ~30 dní (dedup),
   - `data/briefs/tips-backlog.json` — fronta a historie tipů.

### 1 · Sběr kandidátů

Tři vrstvy, od nejdůvěryhodnější. **Rozpočet: 14–24 vyhledávání** — s cílem aspoň 8 zpráv
denně (krok 3) je potřeba širší záběr napříč hráči (OpenAI/ChatGPT, Anthropic/Claude,
Google/Gemini, Microsoft/Copilot, Meta, xAI, další) i typy zdrojů (firemní blogy, media,
release notes), ne jen první nalezená hrstka. Skonči dřív, jen když **tři** dotazy po sobě
nepřinesou nic nového.

**1a · Kánon zdrojů (primární).** 4–6 cílených WebSearch dotazů s `allowed_domains`:
- oficiální (T1): `anthropic.com`, `openai.com`, `blog.google`, `deepmind.google`,
  `microsoft.com`, `learn.microsoft.com`, `nvidia.com`, `ai.meta.com`,
  `huggingface.co`, `mistral.ai`
- média (T2): `theverge.com`, `arstechnica.com`, `techcrunch.com`, `reuters.com`,
  `apnews.com`, `bloomberg.com`, `wired.com`, `theregister.com`,
  `technologyreview.com`, `axios.com`, `cnbc.com`

Pokrývej jádrová témata **samostatným dotazem, každý den, i v klidný den**:
**Anthropic / Claude**, **OpenAI / ChatGPT**, **Google / Gemini**,
**Microsoft 365 Copilot** — a přidej aspoň jeden dotaz navíc na **další velké hráče**
(Meta, xAI/Grok, Mistral, NVIDIA, Amazon), aby se nezůstávalo jen u čtyř jader.

**1b · RSS feed M365 (bonus).** Jediný feed průchozí zdejší sítí:
`curl -sS --max-time 12 "https://www.microsoft.com/en-us/microsoft-365/blog/feed/" | head -c 100000`
Když selže, pokračuj bez něj.

**1c · Široký web search (doplněk).** 3–5 dotazů bez omezení na velké obecné zprávy
(ostatní modely a firmy, coding agenti, regulace/EU, velký byznys, bezpečnost a výzkum,
open-source) a na křížové ověřování.

⚠️ **Síť:** přímé stahování stránek (curl/WebFetch) je pro většinu domén blokované
(CONNECT 403) — výjimkou je microsoft.com výše. Neztrácej čas opakovanými pokusy.

💡 **Tipy hledej aktivně, ne jen mimochodem.** Když má některé jádrové téma
(`claude`·`chatgpt`·`gemini`·`copilot`·`other`) ve frontě `tips-backlog.json` míň
než 2 čekající (`used: null`) tipy, věnuj mu při dnešní rešerši aspoň jeden cílený
dotaz navíc (release notes / help center / oficiální blog dané firmy) — vyšší denní
počet tipů (viz sekce Tipy) potřebuje frontu, která se sama nedoplní.

### 2 · Datace a ověření — brána čerstvosti

**Empirické varování: většina „dnešních novinek" z agregátorů jsou týdny staré zprávy
s novým datem.** Datum digestu/článku NENÍ datum události.

Pro **každého** kandidáta, než ho pustíš dál:

1. **Zjisti datum primární události** (oznámení, účinnost, podání žaloby…) z T1/T2 zdroje —
   ne z agregátoru. Když se datum nedá spolehlivě určit, kandidát **jde ven**.
2. **Okno čerstvosti:** událost starší než **~72 hodin** → ven. Výjimky:
   - **update** — starší událost s novým vývojem: zařaď, formuluj jako update
     (slug `...-update`), novým vývojem musí být to hlavní;
   - **výhledová zpráva** („X vyjde 17. 7."): povolená jen s **konkrétním termínem do
     7 dnů**, vždy `verified: false`, formulace „podle zpráv / očekává se".
3. **URL disciplína:** do `sources` smí **jen URL, které doslova zaznělo ve výsledcích
   rešerše** (WebSearch/feed). Nikdy neskládej URL z paměti. Není-li k dispozici T1/T2
   URL, zprávu vynech.
4. **Křížové ověření** pro `verified: true` — viz definice níže.
5. **Rozpory:** nikdy neprůměruj rozporná čísla. Přednost má primární/oficiální zdroj;
   rozpor buď krátce zmiň („podle X…, Y ale uvádí…"), nebo dej `verified: false`;
   nepodložené drby s rozpornými verzemi vynech.

### 3 · Výběr

- **Cíl 8–12 položek, tvrdý strop 12.** Širší rešerše (krok 1) má dodat víc kandidátů —
  vybírej štědřeji, ale přebytek nad strop se pořád zahazuje, kurátorský výběr zůstává
  hodnotou briefu.
- **Zprávy: cíl aspoň 8 denně.** Rešerše (krok 1) má tomu odpovídat — pokrývej víc úhlů
  (víc hráčů, víc témat na hráče), ne jen první nalezenou hrstku. Na výjimečně tichý den,
  kdy ani širší rešerše 8 skutečných, ověřitelných a neopakujících se zpráv nenajde, dej
  méně a napiš proč do redakčního deníku — nikdy nedoplňuj počet starou/nejistou/
  aggregator-trap zprávou jen kvůli číslu (stejná zásada jako u tipů níže).
- **Priorita:** 1. přímý užitek pro uživatele (funkce, produkty, modely k vyzkoušení;
  přednost jádrová témata) → 2. velikost události → 3. ověřené > neověřené →
  4. čerstvost.
- **Vyváženost:** funkce/produkty/modely ~⅔ briefu, čistý byznys (financování, akvizice,
  žaloby, kvartály) max ~⅓. Mimořádná byznys událost se vejde i jako highlight, ale tři
  fundraisingy v jednom briefu ne.
- **Dedup:** proti poslednímu týdnu briefů **a** proti `published-log.json` (30 dní). Stejná
  událost = neopakovat; nový vývoj = update se změněným slugem. Stejná událost z více
  zdrojů = jedna položka s více zdroji.
- **Příběhové linky (`followsUp`):** když dnešní zpráva navazuje na dřívější díl
  z posledních 7 dní (stejná kauza, nový vývoj), přidej položce pole `followsUp`
  s `date`, `id` a `title` (cs+en) toho dílu — titulek **zkopíruj doslova**, ať je
  odkaz soběstačný. Odkazuj na nejbližší předchozí díl; když nic nenavazuje, pole vynech.
- **Highlight:** právě jedna zpráva — největší událost dne; při rovnosti ta, která se
  uživatele dotkne přímo. Highlight není nikdy tip.
- **Tichý den:** nejdřív rozšiř záběr (obecné dění, pokračování), pak doplň **tipy**
  (viz sekce Tipy), a když je i tak ticho, přiznej to v `intro` a dej méně položek.
  **Nikdy nepřidávej vatu a nikdy si nevymýšlej.**

### 4 · Psaní — stylový manuál

- **Headline:** cíl ≤ 8 slov (strop 12), věcný, žádný clickbait.
- **Intro:** krátký úvod dne — **ideálně 1 věta, nejvýš 2**; **tvrdý strop ~25 slov
  (≈160 znaků)**. Jedna myšlenka: vede pohled, neopakuje titulky. **Žádné řetězení
  přes pomlčky/dvojtečky ani vnořené vedlejší věty** (to je přesně to, co úvod nafoukne).
  Klidný den s tipy poctivě přiznej („Klidný den doplňujeme tipy z posledních týdnů.").
- **Summary zpráv: 40–50 slov v obou jazycích** (tvrdé meze 30–60). Tipy ~35 slov
  (meze 25–55). Žádný řádek „proč je to důležité" — jen fakta.
- **EN není překlad slovo od slova** — piš přirozenou angličtinou, ale **fakta (čísla,
  jména, data) musí být v obou jazycích identická**.
- **Čísla přebírej doslova ze zdroje.** Číslo, které má jen agregátor, do briefu nepatří.
- **Datace v textu:** u událostí piš **konkrétní datum** („15. července"), ne „dnes/včera".
  Relativní výrazy jen pro okno rešerše („za posledních 72 hodin"). **Názvy dnů v týdnu
  nepiš vůbec** — model si mapování datum→den plete; když je den nutný, spočítej ho
  (`date -u -d 2026-07-17 +%A`).
- **Typografie:** uvnitř textů **nikdy ASCII uvozovka `"`** (rozbíjí JSON a je ošklivá) —
  česky „takto“, anglicky ‘takto’ nebo bez uvozovek.
- **Tón:** věcný, jako když ti to shrne chytrý kolega. Shrnutí zpráv neutrálně; jen tipy
  smí lehce tykat (hlas appky).
- **Bez kalků:** v CS textu (headline/intro/summary) nikdy „jádrové nástroje" ani
  podobné neohrabané spojení — když je potřeba shrnout Claude/ChatGPT/Gemini/Copilot
  jako skupinu, buď je vyjmenuj přímo, nebo napiš „hlavní nástroje". (Toto je čistě
  o CS znění — EN „core tools" je v pořádku.)
- **Kanonická jména zdrojů** (pole `name`): Anthropic · OpenAI · Google · DeepMind ·
  Microsoft · Microsoft Learn · NVIDIA · Meta AI · Hugging Face · Mistral · Reuters ·
  AP · Bloomberg · The Verge · Ars Technica · TechCrunch · Axios · Wired ·
  The Register · MIT Technology Review · CNBC · The Information · Quartz.
  Jiný web = přesný název média bez „The Tech…" variací.

### 5 · Kontrola před publikací (povinná)

Po zapsání všech souborů spusť z kořene repa:

```bash
python3 docs/check-brief.py
```

- **FAIL** → oprav a spusť znovu. **S FAILem se nikdy nepublikuje.**
- **WARN** → posuď; když je odchylka záměrná a odůvodněná, smí projít.
- Skript kontroluje: platnost JSON, právě 1 highlight (ne na tipu), kategorie, meze slov,
  názvy dnů, ASCII uvozovky, zakázané domény ve zdrojích, paywall párování, verified se
  ≥2 zdroji, počty tipů, **brzké opakování tipů** (<14 dní od minula = FAIL), konzistenci
  s backlogem a published-logem (zprávy i tipy), index a mazání souborů.

### 6 · Publikace

1. `data/briefs/<datum>.json` podle schématu (`sample: false`).
2. `data/briefs/index.json`: `updated` = aktuální čas (`date -u +%Y-%m-%dT%H:%M:%SZ`) —
   appka ho ukazuje jako „Aktualizováno"; nový záznam navrch; jen **7 nejnovějších dnů**;
   starší **denní** soubory `YYYY-MM-DD.json` smaž. **Nikdy nemaž** `tips-backlog.json`
   a `published-log.json` — to jsou trvalé ledgery.
3. `published-log.json`: připiš **všechny dnešní položky — zprávy i tipy** (`slug`,
   `date`, jednořádkové `topic` česky; u tipu začni topic „tip: “); záznamy starší
   ~30 dní zahoď.
4. `tips-backlog.json`: u zveřejněných tipů nastav `used`; nové kandidáty přidej;
   prune (použité >60 dní, nepoužité >90 dní ven).
5. Kontrola (krok 5) prošla bez FAIL → commit a push **jen obsahu**:
   ```bash
   git add data/briefs/
   git commit -m "brief: <datum>"
   git push origin claude/daily-ai-brief-app-b1qq0p
   ```
   Při non-fast-forward: `git pull --rebase origin claude/daily-ai-brief-app-b1qq0p`
   a push zopakuj.
6. **Redakční deník:** do těla commit message napiš 2–5 odrážek — kolik zpráv/tipů,
   a hlavně **co jsi vyřadil a proč** (stáří, slabé zdroje, rozpor). Slouží k auditu kvality.
7. Netlify tento push záměrně nenasadí — appka vidí data z GitHubu do minuty.

---

## Tipy (evergreen novinky)

Tip = užitečná, ne nutně horká funkce jádrového nástroje z **posledních ~30 dní**, kterou
si uživatel může vyzkoušet. Žijí ve frontě `data/briefs/tips-backlog.json` (appka ho nečte).

- **Kolik:** zprávy mají svůj vlastní cíl (aspoň 8, viz krok 3) — tipy na ně nedoplácí.
  **Počet tipů = 12 − počet čerstvých zpráv, strop 4** (0–8 zpráv → 4 tipy · 9 → 3 ·
  10 → 2 · 11 → 1 · 12 → 0; tvrdý strop 12 položek celkem platí furt). Když fronta tolik
  nezveřejněných tipů nedá, **dej méně položek** — recyklace tipů není výplň. Vzorec je
  ale jen tolik dobrý, kolik dobrý je bank — bez aktivního hledání tipů (viz krok 1)
  na vyšší číslo nedosáhneš.
- **Žádné opakování:** každý zveřejněný tip se zapisuje i do `published-log.json`;
  stejný tip smí vyjít znovu **nejdřív po 14 dnech** od posledního zveřejnění
  (`check-brief.py`: dřív = FAIL, ≥14 dní = WARN k vědomému posouzení). Prázdná
  fronta se neřeší recyklací — dej méně položek, přiznej to v intro a v rešerši
  prioritně doplň bank; stav banku (kolik tipů čeká) napiš do redakčního deníku.
- **Identita:** id `<datum>-tip-<slug>`, **vždy `category: "tools"`** (domov = filtr
  „Nástroje"). **V titulku nikdy slovo „tip"** — titulek je normální věta.
- **Poctivost:** v summary uveď, že nejde o dnešní novinku („Microsoft to nasadil
  v červnu…"). Tip nikdy není highlight.
- **⚠️ Co je vlastně ta novinka:** tip musí stát na tom, co se změnilo za
  **posledních ~30 dní** — ne na starší funkci, kterou zdroj jen znovu popisuje.
  **Ověř stáří samotné funkce, ne jen datum článku:** release notes, dokumentace
  i blogy rády připomínají roky staré věci. Když je nové jen rozšíření, musí to
  nést **titulek i první věta** („X funguje nově i v Y“), ne základní funkce.
  Nejde-li stáří ověřit, tip ven. (Kaz z 3. 8. 2026: Agent Skills v Claude jsou
  z podzimu 2025, nové bylo jen jejich rozšíření do Excelu a PowerPointu —
  titulek přesto vedl starou funkcí.)
- **Rovnoměrnost napříč nástroji:** každý tip má `theme`
  (`claude`·`chatgpt`·`gemini`·`copilot`·`other`). Rotace se řídí **tématy**: na řadě
  je téma nejdéle bez tipu (nikdy nezveřejněné téma první, pak od nejstaršího
  posledního `used`). Vybírá se ale **vždy jen z tipů s `used: null`** — už použitý
  tip není kandidát (viz Žádné opakování). V jednom briefu téma neopakuj, pokud je
  z čeho vybírat. Za měsíc má mít každý jádrový nástroj zhruba stejně tipů.
- **Bank:** kandidáty přidávej průběžně při každé rešerši (`used: null`), přednostně
  z podzastoupených témat; když má některý jádrový nástroj 0 čekajících, prioritně mu
  jednoho najdi.
- **Publish:** ber z fronty (jen `used: null`) podle rotace témat; po zveřejnění
  nastav `used` na dnešek a **připiš tip do `published-log.json`** (stejně jako zprávy).
- **Ověření:** tip z oficiálních release notes / first-party zdroje = `verified: true`
  (cituj aspoň 2 zdroje, např. release notes + oficiální blog, jinak `verified: false`).

---

## Zdroje — tiery důvěryhodnosti

| Tier | Co to je | Role |
|------|----------|------|
| **1 — Primární / oficiální** | anthropic.com/news · openai.com/news · blog.google · deepmind.google · microsoft.com (blog) · learn.microsoft.com (release notes) · nvidianews.nvidia.com · ai.meta.com · huggingface.co (blog) · mistral.ai · oficiální changelogy a tiskové zprávy · SEC/soudní dokumenty | Primární pravda o tom, co firma oznámila |
| **2 — Reputabilní média** | Reuters · AP · Bloomberg · The Verge · Ars Technica · TechCrunch · Axios · The Information · Wired · CNBC · FT · WSJ · The Register · MIT Technology Review | Ověření a kontext |
| **3 — Doplňkové** | agregátory · Hacker News · Reddit · GitHub · specializované blogy · arXiv/preprinty | Jen k **objevení** tématu — nikdy nestačí na „ověřeno" a **nikdy se necitují** |

- **Do `sources` jen Tier 1/2 URL** (1–3 na zprávu). Tier 3 slouží jen k objevení —
  skutečný zdroj dohledej na T1/T2.
- **Paywall (Bloomberg, FT, WSJ, The Information):** cituj jen v páru s volně čitelným
  zdrojem.
- **Nepoužívej:** neznámé blogy, obsahové farmy, sociální sítě bez potvrzení, anonymní
  „leak" účty. (Tvrdý seznam zakázaných domén vynucuje `docs/check-brief.py`.)

### Definice `verified: true`

Zpráva je ověřená, **jen** když ji potvrzují **≥2 nezávislé zdroje**, z toho aspoň jeden
T1/T2. Ideál: oficiální oznámení (T1) + médium (T2), nebo 2× nezávislé médium.
„Nezávislé" = nejde o dva přepisy téže tiskové zprávy.

`verified: false` nastav při: jediný zdroj · pouze T3 · preprint · výhledová zpráva /
únik / rumor · nevyřešený rozpor.

---

## Schémata

### `data/briefs/<datum>.json`

```jsonc
{
  "date": "YYYY-MM-DD",
  "sample": false,
  "headline": { "cs": "...", "en": "..." },   // ≤ 8 slov, věcný
  "intro":    { "cs": "...", "en": "..." },    // krátký úvod, ideálně 1 věta (max ~25 slov)
  "items": [
    {
      "id": "YYYY-MM-DD-kratky-slug",          // tipy: YYYY-MM-DD-tip-<slug>
      "category": "models",                    // models·research·business·tools·policy·opensource
      "highlight": true,                        // právě u JEDNÉ zprávy, jinak vynech
      "verified": true,
      "title":   { "cs": "...", "en": "..." },
      "summary": { "cs": "...", "en": "..." },  // zprávy 40–50 slov, tipy ~35
      "sources": [ { "name": "The Verge", "url": "https://www.theverge.com/..." } ],
      "followsUp": {                            // volitelné — odkaz na starší díl (posledních 7 dní)
        "date": "YYYY-MM-DD", "id": "…", "title": { "cs": "…", "en": "…" }
      }
    }
  ]
}
```

### `data/briefs/index.json`

```jsonc
{
  "updated": "ISO-8601 timestamp",              // čas generování; appka: „Aktualizováno"
  "briefs": [                                   // max 7, nejnovější první
    { "date": "YYYY-MM-DD", "headline": { "cs": "...", "en": "..." }, "itemCount": 5 }
  ]
}
```

### `data/briefs/published-log.json` — trvalý ledger zveřejněných položek (appka NEČTE, NEMAZAT)

```jsonc
{
  "published": [
    { "slug": "2026-07-16-china-ai-companion-rules", "date": "2026-07-16",
      "topic": "čínská pravidla pro polidštěné AI služby účinná" },
    { "slug": "2026-07-16-tip-claude-cowork-web-mobile", "date": "2026-07-16",
      "topic": "tip: Claude Cowork i na webu a mobilu" }
  ]                                             // zprávy i tipy; drž ~30 dní, starší zahoď
}
```

### `data/briefs/tips-backlog.json` — fronta + historie tipů (appka NEČTE, NEMAZAT)

```jsonc
{
  "tips": [
    {
      "slug": "tip-claude-cowork-web-mobile",   // stabilní klíč bez data
      "category": "tools",                       // tip má VŽDY tools
      "theme": "claude",                         // claude·chatgpt·gemini·copilot·other
      "verified": true,
      "title":   { "cs": "...", "en": "..." },
      "summary": { "cs": "...", "en": "..." },   // ~35 slov, poctivé rámování
      "sources": [ { "name": "Anthropic", "url": "https://..." } ],
      "added": "2026-07-16",                     // kdy objeveno
      "used":  null                              // null = fronta, "YYYY-MM-DD" = zveřejněno
    }
  ]
}
```

---

## Guardrails (souhrn)

- **Nikdy si nevymýšlej fakta, čísla ani URL.** Vše musí být dohledatelné ve výsledcích
  dnešní rešerše.
- Datum primární události ověřuj vždy (krok 2) — agregátory recyklují staré zprávy.
- Drž se schémat 1:1. Kontrola `docs/check-brief.py` musí projít bez FAIL.
- Když rešerše, kontrola nebo push selže, jasně ohlas co a proč — a **nikdy nezanechávej
  rozbitý JSON** v repu.

## Časování

- Jediný běh **1× denně v 03:00 UTC** (05:00 CEST v létě / 04:00 CET v zimě) — po konci
  amerického pracovního dne, takže ranní brief nese i čerstvé US novinky.
- Záložní kontrola byla 25. 7. 2026 zrušena (za 9 dní provozu ani jednou nezasáhla).
  Když běh selže, brief chybí viditelně v appce — dogeneruje se na pokyn v session.
