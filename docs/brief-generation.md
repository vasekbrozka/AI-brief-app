# AIspresso — recept pro denní generování briefu (v3.3)

Tento soubor je **závazný recept**, podle kterého se každý den automaticky generuje nový
brief. Naplánovaná (cron) Claude session dostane jednoduchý pokyn:

> „Přečti si `docs/brief-generation.md` a přesně podle něj vygeneruj dnešní brief,
> pak commitni a pushni na produkční větev."

Ladění obsahu = úprava tohoto souboru. Časovač se nepředělává. Recept je psaný tak, aby
podle něj konzistentně pracoval i konzervativní model: **kde jde rozhodnutí nahradit
kontrolou nebo příkazem, udělej to. Co tu není zakázané, není zakázané — nevymýšlej si
přísnější pravidla, než jsou tady.**

**Architektura:** appka čte briefy přímo z GitHubu (`src/lib/briefs.ts`), ne z Netlify.
Commit měnící jen `data/briefs/` a/nebo `docs/` Netlify **záměrně přeskočí** (`ignore`
pravidlo) — přeskočený deploy je správné chování, ne chyba. Denní obsah je tedy zdarma.

**Proč v3:** viz `docs/analyza-receptu-2026-09.md`. Ve zkratce: v2 chtěla 8–12 položek
a dávala 4, protože 72h brána zahazovala nikdy nezveřejněné zprávy, bank tipů byl
prázdný, „ověřeno" motivovalo k citování slabých webů a brief neříkal, co z toho plyne.

---

## Cíl

Čtenář má za pět minut u kávy vědět **co se stalo**, **proč se ho to týká**, **co si může
vyzkoušet** a **co přijde**. Ověřené, dvojjazyčné (CZ + EN), věcné, bez hype.
**Relevance a spolehlivost obsahu je jediný smysl appky** — radši méně a pravdivě než
více a přibližně. Ale „méně" znamená 6, ne 2.

### Co je „přínosné"

Položka je přínosná, když platí aspoň jedno:

1. **Může si to vyzkoušet** — nová funkce, model, produkt, dostupnost nebo cena
   v nástroji, který používá (Claude, ChatGPT, Gemini, Copilot, ale i Perplexity, Cursor,
   Grok, Apple/Samsung AI…).
2. **Mění to, jak má o nástroji uvažovat** — bezpečnostní incident, výpadek s příčinou,
   změna podmínek, dat, cen, regulace, která na něj dopadne.
3. **Je to velká událost oboru**, kterou umí po přečtení převyprávět — financování
   špičkových laboratoří, akvizice, zákony, přelomový výzkum, soudy.

Každá položka to musí umět říct v poli `why` (viz Psaní). Když nevíš, co do `why` napsat,
položka do briefu nepatří.

---

## Pipeline

### 0 · Příprava

1. `cd /home/user/AI-brief-app` a aktualizuj repo
   (`git pull --rebase --autostash origin claude/daily-ai-brief-app-b1qq0p`).
2. Dnešní datum (UTC): `date -u +%F`. Pokud `data/briefs/<dnešek>.json` už existuje a je
   platný JSON, brief je hotový — nic negeneruj a skonči.
3. Přečti si redakční stav:
   - posledních 14 briefů `data/briefs/*.json` (co vyšlo, jaké `radar` termíny se nesou),
   - `data/briefs/published-log.json` — zveřejněné položky za 60 dní (dedup),
   - `data/briefs/tips-backlog.json` — fronta a historie tipů; spočítej, kolik tipů
     čeká (`used: null`) pro každé téma,
   - `data/glossary.json` — slovníček pojmů (viz krok 4b),
   - `data/briefs/feedback.json` — palce nahoru/dolů od čtenářů za 30 dní, když soubor
     existuje (viz sekce Zpětná vazba čtenářů); čerstvější stav dá
     `curl -sS --max-time 10 "https://aispresso.app/api/feedback?days=30"`, pokud síť pustí,
   - `python3 docs/check-brief.py --stats` — čísla za posledních 14 dnů včetně zpětné
     vazby (do deníku).

### 1 · Rešerše — pevný plán, 22–32 dotazů

Jediný funkční nástroj je **WebSearch** (přímé stahování stránek je pro většinu domén
blokované — výjimkou je RSS níže; neztrácej čas opakovanými pokusy). Rešerše se dělá podle
plánu, ne „dokud něco nenajdu":

| Blok | Dotazů | Co a jak |
|---|---|---|
| **A · Newsroomy** (T1, `allowed_domains`) | 5–6 | Po jednom dotazu: Anthropic (`anthropic.com`, `claude.com`) · OpenAI (`openai.com`, `help.openai.com`) · Google (`blog.google`, `deepmind.google`, `googleblog.com`, `google.dev`) · Microsoft (`microsoft.com`) · ostatní hráči najednou (`nvidia.com`, `meta.com`, `mistral.ai`, `x.ai`, `huggingface.co`, `perplexity.ai`, `aboutamazon.com`, `apple.com`) |
| **B · Média** (T2, `allowed_domains`) | 3–4 | `reuters.com`, `apnews.com`, `theverge.com`, `arstechnica.com`, `techcrunch.com`, `axios.com`, `cnbc.com`, `theregister.com`, `wired.com`, `technologyreview.com`, `bloomberg.com`, `ft.com`: jeden dotaz na hlavní hráče, jeden na regulaci/soudy, jeden na byznys/čipy/infrastrukturu |
| **C · Témata** (bez omezení) | 6–8 | modely a benchmarky · agenti a kódovací nástroje · regulace, EU, soudy · investice, akvizice, čipy · výzkum a bezpečnost · open-source/open-weight · spotřební AI (Apple, Samsung, auta, brýle, hodinky) · **Česko a EU** (česká média, `europa.eu`, EU AI Act, tuzemské firmy, úřady a školy) |
| **D · Tipy** (release notes) | 2–4 | pro každé jádrové téma s **< 2 čekajícími tipy**: release notes / help center / changelog dané firmy (`support.claude.com`, `help.openai.com`, `workspaceupdates.googleblog.com`, `techcommunity.microsoft.com`, `learn.microsoft.com`) |
| **E · Radar** | 2–3 | nadcházející termíny: „next week / October 2026 / launch date / effective / deadline / hearing / trial / earnings / keynote" + jména hráčů |
| **F · Ověření** | dle potřeby | k vybraným kandidátům dohledat T1/T2 URL a datum primární události |

Pravidla rešerše:

- **Do dotazu dávej měsíc a rok** („September 2026") a jména produktů, ne jen firem
  („Claude", „ChatGPT", „Gemini", „Copilot"). Stejný dotaz nikdy neopakuj; obměň slova.
- **Blok ukonči**, když tři dotazy po sobě nepřinesou nového kandidáta. Neukončuj celou
  rešerši — další blok hledá jinde.
- Když téma odhalí agregátor (T3), je to jen stopa: jeden dotaz z bloku F dohledá primární
  zdroj a datum. Bez T1/T2 URL kandidát nepokračuje.
- **RSS M365 (bonus):** `curl -sS --max-time 12 "https://www.microsoft.com/en-us/microsoft-365/blog/feed/" | head -c 100000` — když selže, pokračuj bez něj.
- Průběžně veď **tabulku kandidátů**: kandidát · datum události · primární URL · tier ·
  stav (nový / update / duplicita / starý / neověřitelný) · důvod. Z ní vzniká výběr
  i redakční deník.

### 2 · Triáž — datum, dedup, ověření

**Empirické varování:** většina „dnešních novinek" z agregátorů jsou týdny staré zprávy
s novým datem. Datum článku NENÍ datum události. Pro **každého** kandidáta:

1. **Datum primární události** (oznámení, účinnost, podání žaloby, vydání) z T1/T2
   zdroje. Nedá-li se spolehlivě určit → ven. Zapiš ho do `eventDate`.
2. **Okno čerstvosti: 7 dní.** `eventDate` ≥ dnešek − 7 → kandidát. Přednost má
   čerstvější (≤ 48 h > ≤ 72 h > zbytek), ale zpráva stará 4–6 dní, která **v appce
   nevyšla**, je pro čtenáře nová a do briefu patří. Starší událost jen jako **update**
   (slug `...-update`) — novým vývojem musí být to hlavní a `eventDate` je datum nového
   vývoje, ne původní kauzy.
3. **Dedup** proti `published-log.json` (60 dní) a posledním 14 briefům. Stejná událost =
   neopakovat. Nový vývoj = update se změněným slugem a `followsUp`. Stejná událost z více
   zdrojů = jedna položka s více zdroji. **Zpráva, která v appce nikdy nevyšla, není
   „recyklace"** — i když ji agregátory omílají týden.
4. **URL disciplína:** do `sources` smí **jen URL, které doslova zaznělo ve výsledcích
   rešerše**. Nikdy neskládej URL z paměti. Když k dispozici není T1/T2 URL, zprávu vynech
   (výjimka: vlastní newsroom firmy, o které zpráva je — to je T1, i když není v seznamu;
   skript ho jen ohlásí jako WARN).
5. **Rozpory:** nikdy neprůměruj rozporná čísla. Přednost má primární/oficiální zdroj;
   rozpor krátce zmiň („podle X…, Y ale uvádí…"), nebo dej `verified: false`; drby
   s rozpornými verzemi vynech.
6. **Výpadky:** jsou zpráva, jen když jde o jádrový nástroj, trval ≥ 2 hodiny a firma
   potvrdila příčinu. Jinak ven.
7. **Neohlášené funkce, úniky, „testeři objevili":** nejvýš **1 na brief**, vždy
   `verified: false`, titulek to říká („podle zpráv", „testeři objevili").
8. **Co není zpráva:** marketingové „těšíme se", názorové články „AI změní X", pohyby
   akcií z jednoho zdroje, personální změny pod úrovní vedení, preprinty bez T1/T2
   pokrytí (blog laboratoře je T1), stejné oznámení podruhé s jiným titulkem.

### 3 · Výběr

- **Cíl 6–10 položek (zprávy + tipy), tvrdý strop 12.** Pod 5 položek je WARN — smí
  projít jen se zdůvodněním v deníku (co jsi hledal, proč nic nebylo). Nikdy nedoplňuj
  počet starou, nejistou nebo vymyšlenou položkou.
- **Priorita:** 1. přímý užitek pro čtenáře (funkce, modely, dostupnost, ceny; přednost
  jádrová témata) → 2. velikost události → 3. ověřené > neověřené → 4. čerstvost.
- **Vyváženost:** čistý byznys (financování, akvizice, žaloby, kvartály) max ~⅓; víc než
  3 položky o jedné firmě jen v den, kdy firma opravdu dominuje; když existuje kandidát
  mimo Anthropic/OpenAI, aspoň jeden zařaď.
- **Zpráv ≥ tipů.** Tipy doplňují, nenahrazují.
- **Highlight:** právě jedna zpráva — největší událost dne; při rovnosti ta, která se
  čtenáře dotkne přímo. Highlight není nikdy tip.
- **Příběhové linky (`followsUp`):** když dnešní zpráva navazuje na díl z posledních
  14 dnů (stejná kauza, nový vývoj), přidej `followsUp` s `date`, `id` a doslovně
  zkopírovaným `title` (cs + en). Odkazuj na nejbližší předchozí díl.
- **Tichý den:** nejdřív zkontroluj, že jsi prošel všechny bloky rešerše (víkendové
  briefy mají vzít čtvrteční a páteční dění — 7denní okno je k tomu). Pak tipy z fronty.
  Pak radar. Když je i tak ticho, dej méně a napiš to do deníku, ne do textů.

### 4 · Psaní — stylový manuál

Každá položka má **čtyři vrstvy**: titulek (co), shrnutí (fakta), `why` (proč se tě to
týká), zdroje (odkud). Plus `eventDate` (kdy se to stalo).

- **Titulek:** cíl ≤ 9 slov (strop 12), věcný, bez clickbaitu; „průlom", „revoluce" jen
  v citaci.
- **Shrnutí (`summary`): 35–55 slov v obou jazycích** (tvrdé meze 30–60), tipy 25–55.
  Jen fakta: kdo, co, kdy (**konkrétní datum**: „16. září"), kde, za kolik, pro koho.
  Čísla doslova ze zdroje; číslo, které má jen agregátor, do briefu nepatří.
- **Proč na tom záleží (`why`): 12–35 slov** (tvrdé meze 8–40), 1–2 věty. Odpovídá na
  „a co z toho" — jedna z možností: co si čtenář může hned vyzkoušet (kde, v jakém plánu,
  za kolik) · co se mění pro uživatele nástroje X · na co si dát pozor / co sledovat dál ·
  co to znamená v širším obrazu. Konkrétně, bez hype, **neopakuje shrnutí**. Smí oslovit
  čtenáře („Když používáš Copilot…"). U tipu je `why` návod: kde to zapnout, v jakém
  plánu, na jaké platformě.
- **`eventDate`:** ISO datum primární události (u tipu datum vydání funkce).
- **EN není překlad slovo od slova** — přirozená angličtina, ale **fakta (čísla, jména,
  data) identická** v obou jazycích.
- **Headline briefu:** ≤ 9 slov (strop 12), věcný, o hlavní zprávě. Ukazuje se v archivu,
  v ranní notifikaci a při sdílení.
- **Intro brief nemá** (od v3.2): pod nadpisem jsou rovnou karty. Pole `intro` vynech —
  skript ho ohlásí. Tichý den se nikde neomlouvá, jen se zdůvodní v deníku.
- **Datace v textu:** konkrétní datum („15. července"), ne „dnes/včera". **Názvy dnů
  v týdnu nepiš vůbec** — když je den nutný, spočítej ho (`date -u -d 2026-09-17 +%A`)
  a stejně napiš datum.
- **Typografie:** uvnitř textů **nikdy ASCII uvozovka `"`** — česky „takto“, anglicky
  ‘takto’ nebo bez uvozovek.
- **Tón:** věcný, jako když ti to shrne chytrý kolega. Shrnutí neutrálně; `why` a tipy
  smí lehce tykat (hlas appky).
- **Bez kalků:** v CS textu nikdy „jádrové nástroje" — vyjmenuj je, nebo „hlavní
  nástroje". (EN „core tools" je v pořádku.)
- **Kanonická jména zdrojů** (pole `name`): Anthropic · OpenAI · Google · DeepMind ·
  Microsoft · Microsoft Learn · NVIDIA · Meta · Hugging Face · Mistral · xAI · Apple ·
  Reuters · AP · Bloomberg · The Verge · Ars Technica · TechCrunch · Axios · Wired ·
  The Register · MIT Technology Review · CNBC · The Information · Financial Times ·
  Wall Street Journal · NPR · Fortune · VentureBeat. Jiný web = přesný název média.

### 4b · Slovníček (`data/glossary.json`)

Appka podtrhává pojmy ze slovníčku a po ťuknutí ukáže prosté vysvětlení. Když dnešní
texty (shrnutí, `why`, radar) používají odborný pojem, který ve slovníčku chybí — nová
architektura, technika, zkratka, regulační termín — **přidej ho**, nejvýš 3 denně:

```jsonc
{
  "id": "distillation",
  "term":    { "cs": "Destilace modelu", "en": "Model distillation" },
  "aliases": ["destilace", "destilaci", "destilací", "distillation", "distilled"],
  "short":   { "cs": "≤ 35 slov, prostě a bez žargonu, jako když to vysvětluješ kolegovi.", "en": "…" }
}
```

- Aliasy = tvary, jak se v textech skutečně vyskytují (české pády, anglické množné
  číslo); porovnávají se jako celá slova bez ohledu na velikost písmen. Nepřidávej
  aliasy, které jsou běžná slova („model", „agentura").
- `updated` nastav na dnešek, když něco přidáš. Existující záznamy nemaž ani
  nepřepisuj (jen oprav zjevnou chybu). Skript slovníček kontroluje při každém běhu.

### 5 · Na obzoru (`radar`)

Kalendář nadcházejících termínů — to, co v2 zahazovala. **0–6 položek** (strop 8),
seřazených podle data:

- Jen **konkrétní datum do 30 dnů** (delší jen výjimečně, WARN) z T1/T2 zdroje: oznámení
  firmy, pořadatel akce, soud, regulátor, kalendář výsledků. Bez zdroje termín neexistuje.
- Co patří na radar: vydání a rollouty s datem, konference a keynoty (DevDay, I/O, Build,
  Ignite, GTC, Apple event), účinnost zákonů a lhůty (EU AI Act, podpisy guvernéra),
  soudní jednání a rozsudky, kvartální výsledky velkých AI firem, konec podpory / vypnutí
  funkce, deadline pro migraci API.
- `tentative: true`, když datum uvádí jen médium a pořadatel ho nepotvrdil — titulek pak
  říká „podle zpráv".
- **Přenášení:** termín z včerejšího briefu, který je stále v budoucnu, zkopíruj doslova
  (aktualizuj jen změnu). Když datum uplynulo: stalo se → dnes je to zpráva; posunulo se
  → nové datum, nebo ven. Radar se do `published-log.json` nezapisuje. Skript porovná
  dnešní radar se včerejším a ohlásí termín, který zmizel, aniž uplynul.
- Texty: `title` ≤ 12 slov, `note` ≤ 30 slov (co se má stát a proč to čtenáře zajímá).

### 5b · Týden v AI (`weekInReview`, jen nedělní brief)

Nedělní brief (`date -u -d <dnešek> +%u` dá `7`) nese navíc ohlédnutí za týdnem —
**4–6 položek** z briefů posledních 7 dnů, seřazených podle důležitosti. Víkendové
zprávy jsou tenké; ohlédnutí dělá z neděle nejbohatší čtení týdne a dožene, co čtenář
přes týden minul.

- Každá položka odkazuje na existující zprávu z archivu: `date`, `id` a **doslovně
  zkopírovaný** `title` (cs + en), plus `note` (≤ 25 slov): proč to byla událost týdne
  a co se od té doby stalo (když nic, jen proč to bylo důležité).
- Vybírej napříč firmami a tématy; tipy do ohlédnutí nepatří. Hlavní zpráva soboty
  může být v ohlédnutí taky — nevylučují se.
- **Žádná nová rešerše**: zdrojem jsou vlastní briefy v `data/briefs/`. Skript ověří,
  že `id` existují a titulky sedí.
- V jiné dny pole vynech.

### 5c · Kvíz dne (`quiz`)

Po dočtení má mít čtenář v appce co dělat — **tři otázky z faktů dnešního briefu**:

- Každá otázka se váže na jinou položku (`itemId`) a ptá se na **konkrétní fakt ze
  shrnutí**: číslo, datum, jméno, funkci, podmínku. Správná odpověď musí být ve shrnutí
  doslova dohledatelná; nic, co by čtenář nemohl vědět z briefu.
- **Přesně 3 možnosti**, stejného druhu (tři čísla, tři firmy…), věrohodné distraktory,
  žádné „všechno výše". `answer` = index správné (0–2); pořadí appka míchá sama.
- `question` ≤ 20 slov, končí otazníkem; možnosti ≤ 8 slov; `explain` 1 věta ≤ 25 slov,
  která fakt zopakuje (čtenář ji uvidí po odpovědi).
- Tón jako zbytek appky: věcný, žádné chytáky na slovíčka.

### 6 · Kontrola před publikací (povinná)

Po zapsání všech souborů spusť z kořene repa:

```bash
python3 docs/check-brief.py
```

- **FAIL** → oprav a spusť znovu. **S FAILem se nikdy nepublikuje.**
- **WARN** → posuď; když je odchylka záměrná a odůvodněná, smí projít — důvod do deníku.
- Skript kontroluje: platnost JSON a schéma v3, právě 1 highlight (ne tip), kategorie,
  `kind`, meze slov (titulek, shrnutí, `why`), **stáří `eventDate`** (zprávy 7 dní,
  tipy 60), názvy dnů, ASCII uvozovky, kalky, **kvíz** (vazba na položky, 3 možnosti,
  meze), zakázané domény,
  paywall párování, **tiery zdrojů a definici ověřeno**, kanonická jména zdrojů, tipy
  (počet, backlog, žádné opakování), radar (data, meze, zdroje, řazení, **přenos ze
  včerejška**), **podobné titulky** proti posledním 14 dnům, `weekInReview`,
  `followsUp`, slovníček, published-log, index.
- `python3 docs/check-brief.py --stats` vypíše posledních 14 dnů (položky, zprávy, tipy,
  radar, podíl ověřených a slabých zdrojů) — průměr patří do deníku.
- Ladění mimo denní běh: `python3 docs/check-brief.py --file cesta.json` zkontroluje jen
  schéma a texty (bez indexu a ledgerů).

### 7 · Publikace

1. `data/briefs/<datum>.json` podle schématu níže (`sample: false`).
2. `data/briefs/index.json`: `updated` = aktuální čas (`date -u +%Y-%m-%dT%H:%M:%SZ`);
   nový záznam navrch; drž **14 nejnovějších dnů**. **Denní soubory se nemažou** — git
   ani appka je nepotřebují mazat, starší dny prostě nejsou v indexu.
3. `published-log.json`: připiš **všechny dnešní položky — zprávy i tipy** (`slug`,
   `date`, jednořádkové `topic` česky; u tipu topic začíná „tip: “); záznamy starší
   **60 dní** zahoď.
4. `tips-backlog.json`: u zveřejněných tipů nastav `used`; nové kandidáty přidej;
   použité starší 90 dnů ven.
5. Kontrola (krok 6) prošla bez FAIL → commit a push **jen obsahu** (briefy, ledgery
   i slovníček; Netlify adresář `data/` nenasazuje):
   ```bash
   git add data/
   git commit -F <soubor s deníkem>
   git push origin claude/daily-ai-brief-app-b1qq0p
   ```
   Při non-fast-forward: `git pull --rebase origin claude/daily-ai-brief-app-b1qq0p`
   a push zopakuj.
6. **Redakční deník** = tělo commit message, pevná osnova (slouží k auditu kvality):
   ```
   brief: YYYY-MM-DD

   N zpráv + M tipů + K na obzoru · highlight: <titulek> · ověřeno X/N+M
   Rešerše: <počet dotazů> (A n · B n · C n · D n · E n · F n)

   Vyřazeno:
   - <kandidát> — <důvod: starší než 7 dní (datum) / už vyšlo <datum> / jen T3 / rozpor / neověřitelné datum>
   - …

   Bank tipů: <kolik čeká> (claude n · chatgpt n · gemini n · copilot n · other n); přidáno <n>
   Radar: +<nové> / −<odstraněné a proč> · Slovníček: +<n> · Týden v AI: <n položek | ne>
   Průměr za 14 dnů: <položek/den ze `--stats`>
   Zpětná vazba (30 dní): 👍 n · 👎 n · nejvíc 👍: <id> · nejvíc 👎: <id>
   Poznámky: <odchylky od receptu a jejich zdůvodnění; WARN, které jsi pustil>
   ```
7. Netlify tento push záměrně nenasadí — appka vidí data z GitHubu do minuty.

---

## Tipy (vyzkoušej si)

Tip = užitečná funkce nástroje, kterou si čtenář může vyzkoušet, z **posledních ~60 dní**.
Není nutně horká; je nutně použitelná. Žijí ve frontě `data/briefs/tips-backlog.json`.
**Appka backlog čte**: sekce „Vyzkoušej si" ukazuje tipy s `used` z posledních 30 dnů jako
checklist, který si čtenář odškrtává. Proto u každého záznamu drž `title`, `why`,
`sources` a `used` přesné a nikdy záznamy nepřepisuj zpětně.

- **Kolik:** **0–3 denně**, z toho, co fronta dá. Žádný vzorec, žádné doplňování na číslo.
  Tip nikdy nevytlačí zprávu (zpráv ≥ tipů).
- **Žádné opakování:** tip, který už vyšel (je v `published-log.json`), znovu nevychází —
  skript to zamítne. Rozšíření funkce na novou platformu je nový tip s novým slugem
  a titulkem, který vede tím, co je nové („X funguje nově i v Y").
- **Identita:** `kind: "tip"`, id `<datum>-tip-<slug>`, **vždy `category: "tools"`**.
  **V titulku nikdy slovo „tip"** — titulek je normální věta.
- **Poctivost:** v `summary` uveď, kdy funkce vyšla („Microsoft to nasadil 3. září…").
  `eventDate` = datum vydání funkce. **Ověř stáří funkce, ne jen článku** — release notes
  rády připomínají roky staré věci. Nejde-li stáří ověřit, tip ven.
- **`why` u tipu = návod:** kde to najdu (menu, aplikace, platforma), v jakém plánu, pro
  koho, případně na co si dát pozor.
- **Témata (`theme`):** `claude` · `chatgpt` · `gemini` · `copilot` · `other`. Rotace je
  **preference, ne podmínka**: přednost má téma nejdéle bez tipu, ale když pro něj fronta
  nic nemá a jiné téma má dobrý kandidát, vydej ten. Prázdný slot kvůli rotaci je chyba.
- **Bank:** kandidáty přidávej při každé rešerši (`used: null`, s `why` a `eventDate`);
  téma s 0 čekajícími dostane v bloku D vlastní dotaz.
- **Ověření tipu:** oficiální release notes / blog (T1) = `verified: true`. Jinak false.

---

## Zpětná vazba čtenářů (`data/briefs/feedback.json`)

U každé novinky má čtenář palec nahoru/dolů. Ukládají se jen počítadla u id položky
(žádný uživatel, zařízení ani IP). Funkce na Netlify je každou noc ve 2:30 UTC zapisuje
do repa jako `data/briefs/feedback.json` (posledních 30 dní):

```jsonc
{
  "updated": "ISO-8601", "days": 30,
  "items": { "2026-09-18-claude-cowork-chat-merge-docs-slides-design": { "up": 4, "down": 0 } }
}
```

Jak s tím pracovat — **měkký signál, ne pravidlo**:

- Podívej se, **jaké druhy položek** sbírají palce nahoru (funkce k vyzkoušení, tipy,
  konkrétní firma, kategorie) a jaké dolů (čistý byznys, personálie, vzdálená politika).
  Při rovnosti kandidátů dej přednost druhu, který čtenáři oceňují.
- Položka s **≥ 2 palci dolů a žádným nahoru** je varování pro svůj druh, ne důvod téma
  zamlčet, když je důležité. Nikdy nehoň hlasy clickbaitem ani přeháněním.
- Když soubor chybí nebo je prázdný, nic se nemění.
- Do deníku napiš řádek `Zpětná vazba (30 dní): 👍 n · 👎 n · nejvíc 👍: <id> · nejvíc 👎: <id>`
  (`--stats` to vypíše) a jednou větou, jestli jsi podle toho něco zvolil jinak.

---

## Zdroje — tiery a definice ověřeno

| Tier | Co to je | Role |
|---|---|---|
| **1 — Oficiální** | vlastní web firmy, o které zpráva je (newsroom, blog, release notes, help center, changelog), vládní a soudní weby (`*.gov`, `europa.eu`, `gov.uk`), regulátoři, osobní blog šéfa firmy pro jeho vlastní prohlášení | Primární pravda o tom, co firma oznámila |
| **2 — Média** | Reuters · AP · Bloomberg · FT · WSJ · NYT · Washington Post · The Verge · Ars Technica · TechCrunch · Axios · Wired · The Register · MIT Technology Review · CNBC · The Information · Semafor · Politico · NPR · BBC · Guardian · Fortune · VentureBeat · ZDNet · Engadget · 9to5Google · 9to5Mac · MacRumors · The Hill · Business Insider · Forbes · Nature · Science · GeekWire · SiliconANGLE · Windows Central · Android Authority · Tom's Hardware · TechRadar · PCMag · CNET · 404 Media · IEEE Spectrum · Quartz · The Next Web · BleepingComputer · SecurityWeek · NBC/CBS/ABC News · LA Times · CalMatters · STAT · SCMP · Nikkei · česká média (Seznam Zprávy, iROZHLAS, ČT24, Lupa, HN, E15, Deník N) | Ověření a kontext |
| **3 — Ostatní** | agregátory, Hacker News, Reddit, GitHub, YouTube, sociální sítě, tiskové wire, syndikace (Yahoo Finance, MSN), lokální a oborové weby mimo seznam, arXiv | Jen k **objevení** — nepočítají se do ověření; do `sources` jen když T1/T2 URL neexistuje (skript ohlásí WARN) |

Úplné seznamy domén nese `docs/check-brief.py` (`T1_DOMAINS`, `T2_DOMAINS`) — když
přidáváš doménu, přidej ji tam.

- **`sources`: 1–3 na položku.** Pořadí: primární zdroj první (ten se sdílí).
- **Paywall (Bloomberg, FT, WSJ, NYT, The Information, Economist):** cituj jen v páru
  s volně čitelným zdrojem.
- **Nepoužívej:** neznámé blogy, obsahové farmy, sociální sítě, anonymní „leak" účty.
  (Tvrdý seznam zakázaných domén vynucuje `docs/check-brief.py`.)

### Definice `verified: true`

Zpráva je ověřená, když ji potvrzuje **aspoň jeden oficiální zdroj (T1)**, nebo
**aspoň dva různé mediální zdroje (T2)**. Oficiální oznámení je samo o sobě důkazem, že
firma věc oznámila — druhý web k němu nic nepřidává, **nehledej ho jen kvůli počtu**.
Ideál zůstává T1 + T2 (oznámení + kontext), ale není podmínkou.

`verified: false` vždy při: jen T3 zdroje · jediný T2 zdroj · preprint bez T1 · únik,
rumor, neohlášená funkce · nevyřešený rozpor · termín „podle zpráv".

---

## Schémata

### `data/briefs/<datum>.json`

```jsonc
{
  "date": "YYYY-MM-DD",
  "sample": false,
  "headline": { "cs": "...", "en": "..." },   // ≤ 9 slov (strop 12), o hlavní zprávě
  "items": [
    {
      "id": "YYYY-MM-DD-kratky-slug",          // tipy: YYYY-MM-DD-tip-<slug>; update: ...-update
      "kind": "news",                          // news · tip
      "category": "models",                    // models·research·business·tools·policy·opensource
      "highlight": true,                        // právě u JEDNÉ zprávy, jinak vynech
      "verified": true,                         // T1 ≥ 1 nebo T2 ≥ 2, viz definice
      "eventDate": "YYYY-MM-DD",               // datum primární události (tip: vydání funkce)
      "title":   { "cs": "...", "en": "..." },  // ≤ 9 slov
      "summary": { "cs": "...", "en": "..." },  // zprávy 35–55 slov, tipy 25–55; jen fakta
      "why":     { "cs": "...", "en": "..." },  // 12–35 slov: proč se to čtenáře týká / jak to vyzkoušet
      "sources": [ { "name": "OpenAI", "url": "https://openai.com/..." } ],   // 1–3, primární první
      "followsUp": {                            // volitelné — starší díl z posledních 14 dnů
        "date": "YYYY-MM-DD", "id": "…", "title": { "cs": "…", "en": "…" }
      }
    }
  ],
  "radar": [                                    // volitelné, 0–6, seřazeno podle data
    {
      "date": "YYYY-MM-DD",                     // konkrétní datum do 30 dnů
      "title": { "cs": "...", "en": "..." },    // ≤ 12 slov
      "note":  { "cs": "...", "en": "..." },    // ≤ 30 slov: co se stane a proč to sledovat
      "sources": [ { "name": "OpenAI", "url": "https://openai.com/..." } ],   // 1–2
      "tentative": false                        // true = datum zatím jen podle médií
    }
  ],
  "weekInReview": [                             // jen nedělní brief, 4–6 položek podle důležitosti
    {
      "date": "YYYY-MM-DD", "id": "YYYY-MM-DD-slug",   // existující zpráva z posledních 7 dnů
      "title": { "cs": "…", "en": "…" },        // doslovná kopie titulku
      "note":  { "cs": "…", "en": "…" }         // ≤ 25 slov: proč to byla událost týdne / co následovalo
    }
  ],
  "quiz": [                                     // vždy 3 otázky z faktů dnešních položek
    {
      "itemId": "YYYY-MM-DD-kratky-slug",       // položka, o které otázka je
      "question": { "cs": "…?", "en": "…?" },   // ≤ 20 slov
      "options":  [ { "cs": "…", "en": "…" }, { "cs": "…", "en": "…" }, { "cs": "…", "en": "…" } ],
      "answer": 1,                              // index správné možnosti (0–2)
      "explain":  { "cs": "…", "en": "…" }      // 1 věta ≤ 25 slov, zopakuje fakt
    }
  ]
}
```

Kompletní ukázka: `docs/examples/brief-v3-example.json`
(`python3 docs/check-brief.py --file docs/examples/brief-v3-example.json`).

### `data/glossary.json` — slovníček pojmů (appka ČTE; jen přidávat)

```jsonc
{
  "updated": "YYYY-MM-DD",                      // den poslední změny
  "terms": [
    { "id": "moe", "term": { "cs": "…", "en": "…" }, "aliases": ["…"], "short": { "cs": "…", "en": "…" } }
  ]
}
```

### `data/briefs/index.json`

```jsonc
{
  "updated": "ISO-8601 timestamp",              // čas generování; appka: „Aktualizováno"
  "briefs": [                                   // max 14, nejnovější první
    { "date": "YYYY-MM-DD", "headline": { "cs": "...", "en": "..." }, "itemCount": 8 }
  ]
}
```

### `data/briefs/published-log.json` — trvalý ledger zveřejněných položek (appka NEČTE, NEMAZAT)

```jsonc
{
  "published": [
    { "slug": "2026-09-18-claude-cowork-chat-merge", "date": "2026-09-18",
      "topic": "Anthropic sloučil Cowork s chatem, přidal Docs a Slides" },
    { "slug": "2026-09-18-tip-chatgpt-word-integration", "date": "2026-09-18",
      "topic": "tip: ChatGPT jako doplněk ve Wordu" }
  ]                                             // zprávy i tipy; drž 60 dní, starší zahoď
}
```

### `data/briefs/tips-backlog.json` — fronta + historie tipů (appka ČTE pro „Vyzkoušej si", NEMAZAT)

```jsonc
{
  "tips": [
    {
      "slug": "tip-chatgpt-word-integration",   // stabilní klíč bez data
      "category": "tools",                       // tip má VŽDY tools
      "theme": "chatgpt",                        // claude·chatgpt·gemini·copilot·other
      "verified": true,
      "eventDate": "2026-09-17",                 // kdy funkce vyšla
      "title":   { "cs": "...", "en": "..." },
      "summary": { "cs": "...", "en": "..." },   // 25–55 slov, poctivé rámování
      "why":     { "cs": "...", "en": "..." },   // návod: kde, v jakém plánu, pro koho
      "sources": [ { "name": "OpenAI", "url": "https://help.openai.com/..." } ],
      "added": "2026-09-18",                     // kdy objeveno
      "used":  null                              // null = fronta, "YYYY-MM-DD" = zveřejněno
    }
  ]
}
```

---

## Guardrails (souhrn)

- **Nikdy si nevymýšlej fakta, čísla, data ani URL.** Vše musí být dohledatelné ve
  výsledcích dnešní rešerše.
- Datum primární události ověřuj vždy (krok 2) — agregátory recyklují staré zprávy;
  ale nezveřejněná zpráva z minulého týdne není recyklace.
- Drž se schémat 1:1. Kontrola `docs/check-brief.py` musí projít bez FAIL.
- Nepřidávej si pravidla, která tu nejsou (kratší okno, „výpadky se nepočítají",
  zálohování mazaných souborů…). Když ti něco chybí, napiš to do deníku — recept se ladí
  tady, ne v hlavě jedné session.
- Když rešerše, kontrola nebo push selže, jasně ohlas co a proč — a **nikdy nezanechávej
  rozbitý JSON** v repu.

## Časování

- Jediný běh **1× denně v 03:00 UTC** (05:00 CEST v létě / 04:00 CET v zimě) — po konci
  amerického pracovního dne, takže ranní brief nese i čerstvé US novinky.
- Víkendové a pondělní briefy jsou z podstaty tenčí na čerstvé oznámení; 7denní okno
  a radar je mají dorovnat. Když běh selže, brief chybí viditelně v appce — dogeneruje se
  na pokyn v session.

## Změny v3.3 (20. 9. 2026)

- **Zpětná vazba čtenářů**: palce u novinek se sbírají anonymně a noční funkce je zapisuje
  do `data/briefs/feedback.json`; recept je čte jako měkký signál pro výběr, `--stats` je
  shrne do deníku.

## Změny v3.2 (20. 9. 2026)

- **Intro zrušeno**: appka ukazuje pod nadpisem rovnou karty; pole `intro` se nepíše.
- **Kvíz dne** (`quiz`): 3 otázky z faktů dnešních položek, po dočtení má čtenář co dělat.
- **Appka čte `tips-backlog.json`** jako checklist „Vyzkoušej si" (tipy za 30 dnů).

## Změny v3.1 (20. 9. 2026)

- **Týden v AI** (`weekInReview`) v nedělním briefu: 4–6 událostí týdne s odkazem do
  archivu, bez nové rešerše.
- **Slovníček** je součást receptu: nové pojmy z dnešních textů se přidávají do
  `data/glossary.json` (max 3 denně), skript ho kontroluje, commit bere `data/`.
- Rešerše má blok **Česko a EU**; skript nově hlídá podobné titulky proti 14 dnům,
  přenos radaru ze včerejška a kanonická jména zdrojů; `--stats` dává čísla do deníku.

## Změny proti v2 (19. 9. 2026)

- Okno čerstvosti 72 h → **7 dní**; dedup 30 → **60 dní**; soubory se **nemažou**;
  index 7 → **14 dnů**.
- Nová pole **`why`**, **`eventDate`**, **`kind`** u položek a sekce **`radar`** u briefu.
- Cíl 8–12 („aspoň 8 zpráv") → **6–10**, pod 5 WARN; tipy **0–3** bez vzorce, okno 60 dnů,
  rotace jen preference, žádné opakování.
- **Ověřeno = T1 ≥ 1 nebo T2 ≥ 2**; skript zná seznamy domén; neznámá doména = WARN.
- Rešerše podle **plánu A–F, 20–30 dotazů**; intro bez počítání položek; deník s pevnou
  osnovou; explicitní pravidla pro výpadky, úniky a co není zpráva.
