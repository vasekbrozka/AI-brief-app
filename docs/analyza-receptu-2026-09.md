# Analýza receptu pro denní brief — stav k 19. 9. 2026

Podklad pro redesign receptu (v3). Vychází ze všech 50 dosud vygenerovaných briefů
(25. 7. – 19. 9. 2026, obnoveno z git historie), z ledgerů `published-log.json`
a `tips-backlog.json` a z redakčních deníků v commit messages.

## Shrnutí

Recept v2 (od 19. 8.) chce **8–12 položek denně, z toho aspoň 8 zpráv**. Skutečnost za 31 dní
provozu v2: **průměr 4,4 položky, medián 4**. Cíl 8+ padl jen 3× (27. 8., 28. 8., 6. 9.).
V září je to 4,2 položky denně, tipů 0,7 a **7 z 19 dnů vyšlo bez jediného tipu**.

Není to nedostatkem snahy. Deníky ukazují 17–35 vyhledávání denně. Problém jsou pravidla
receptu, která **nalezený obsah systematicky zahazují**, a formát, který z toho, co projde,
nevytěží, co by mohl. Pět hlavních příčin:

1. **Brána čerstvosti 72 h zahazuje dobré, nikdy nezveřejněné zprávy** — deníky opakovaně
   vyřazují kandidáty staré ~96 h („zajímavé, ale nad hranicí“), které přitom nikdy nevyšly.
2. **Systém tipů se zadrhl**: bank je prázdný (84 tipů, 83 použito, 1 čeká), přesto recept
   vyžaduje rotaci témat, 30denní okno a vzorec „12 − zprávy“. Model tráví dny hledáním tipu
   pro jedno téma (`other` 7 dní, `gemini` 11 dní) a nic nevydá.
3. **Definice „ověřeno = ≥2 zdroje“ vede k citování slabých webů.** 23 % citovaných zdrojů
   je mimo Tier 1/2 (lokální rádio 1027wbow.com, Bozeman Daily Chronicle, GV Wire,
   Crypto Briefing, Malay Mail, InvestingLive…) — jen proto, aby vznikl „druhý zdroj“.
4. **Brief neříká, co z toho plyne.** Recept výslovně zakazuje řádek „proč je to důležité“.
   Karta = titulek + 45 slov faktů + zdroje. Čtenář si musí význam domyslet sám.
5. **Výhledové informace se zahazují**: termíny do 7 dnů se smí zmínit jen jako zpráva,
   všechno vzdálenější jde ven (kalifornské AI zákony s podpisem do 30. 9., ohlášená změna
   v Excelu k 14. 9., posunutý Grok 4.7…). Přitom „co přijde“ je pro čtenáře jedna
   z nejužitečnějších informací.

## 1 · Čísla

| Období | Dnů | Položek/den (⌀ · medián) | Zpráv/den | Tipů/den | Dnů ≥ 8 | Dnů ≤ 3 |
|---|---|---|---|---|---|---|
| Celkem (25. 7. – 19. 9.) | 50 | 4,3 · 4 | 3,0 | 1,3 | 3 | 15 |
| Recept v2 (od 20. 8.) | 31 | 4,4 · 4 | 3,4 | 1,0 | 3 | 9 |
| Září | 19 | 4,2 · 4 | 3,4 | 0,7 | 1 | 6 |

Zpráv podle dne v týdnu (datum briefu; brief ve 3:00 UTC pokrývá předchozí den):

| Po | Út | St | Čt | Pá | So | Ne |
|---|---|---|---|---|---|---|
| 2,3 | 2,1 | 3,0 | 4,4 | 3,6 | 3,1 | 2,6 |

Pondělní a úterní brief (víkend + pondělí v USA) jsou nejslabší; recept nemá mechanismus
„dohnat“ čtvrteční a páteční dění, které o víkendu zestárne za 72 h.

Skladba 214 položek: nástroje 98 (včetně tipů), byznys 45, regulace 33, výzkum 22,
modely 13, open source 3. Ověřeno 123, neověřeno 91.

Zdroje (364 citací): Tier 1 (oficiální) 94 · Tier 2 (média) 186 · **ostatní 84 (23 %)**.

## 2 · Příčiny podrobně (z redakčních deníků)

### 2.1 Brána čerstvosti 72 h

Recept: „událost starší než ~72 hodin → ven“. Model si z toho udělal pravidlo „72–80 h“
a důsledně vyřazuje i dobré kandidáty:

- 8. 9.: DeepSeek 160 000 čipů Huawei, G42 zvažuje americké vlastnictví, GPT-6 Astra
  v Copilot Cowork — „všechno zajímavé, ale nad hranicí ~72 hodin“. Brief měl 1 zprávu.
- 19. 9.: tip Gemini Notebook z 15. 9. — „~96 hodin, mimo pravidlo“. Brief měl 2 zprávy,
  téma `gemini` bylo 11 dní bez tipu.
- 6. 9.: Gemini agentic video a Meta Muse Spark 1.3 (1.–2. 9.) — vyřazeno z 72 h okna,
  přesunuto do banku tipů, odkud vyšly až 7. 9. jako „tipy“.

Skutečnou ochranou proti recyklaci starých zpráv je **dedup proti `published-log.json`**
(30 dnů) plus ověření data primární události. Okno 72 h k tomu nic nepřidává — jen
zahazuje. Zpráva stará 4–6 dní, kterou čtenář v appce ještě neviděl, je pro něj nová.

### 2.2 Tipy

- Bank: 84 tipů, **83 použito, 1 čeká** (a ten je 22 dní „nejasný“). Vzorec
  „počet tipů = 12 − zprávy, strop 4“ nemá z čeho brát.
- Rotace témat je tvrdá: „na řadě je téma nejdéle bez tipu“. Když pro něj nic není, model
  raději nevydá **žádný** tip, i když má kandidáta pro jiné téma (14. 9.: „Sedmý den bez
  tipu pro toto téma“, brief bez tipu).
- 30denní okno pro tipy + 72 h okno pro zprávy vytváří **díru 3–30 dnů**, do které spadne
  všechno, co není „funkce jádrového nástroje“: model, studie, produkt jiné firmy z minulého
  týdne není ani zpráva, ani tip. Model sám 13. 9. píše: „Tuhle mezeru budu muset vyřešit
  jinak… možná rozšířit definici.“

### 2.3 Ověření a kvalita zdrojů

Recept: `verified: true` = ≥ 2 nezávislé zdroje, aspoň jeden T1/T2; do `sources` jen T1/T2.
V praxi: oficiální oznámení (T1) + libovolný druhý web, aby vzniklo „ověřeno“. Příklady
z posledního týdne: OpenAI Astra for Law = SiliconANGLE + PYMNTS (žádný T1, přestože
oznámení je na openai.com); sponzorovaní agenti v ChatGPT = rádio 1027wbow.com
+ GlobeNewswire; Anthropic R&D index = Unite.AI + Bozeman Daily Chronicle.

Kontrolní skript zakazuje 22 domén, ale nezná pozitivní seznam — cokoli jiného projde.
Oficiální oznámení firmy je přitom samo o sobě důkazem, že firma věc oznámila; druhý zdroj
u něj nic neověřuje.

### 2.4 Chybí „a co z toho“

Recept, sekce Psaní: „Žádný řádek ‚proč je to důležité‘ — jen fakta.“ Výsledek: shrnutí
jsou hutná a správná, ale karta neodpovídá na otázku, kvůli které si člověk brief čte —
**co to znamená pro mě, pro můj nástroj, co s tím mám udělat**. U tipů chybí „kde to najdu
a v jakém plánu“, u zpráv „koho se to týká a od kdy“.

### 2.5 Výhled se zahazuje

Recept povoluje „výhledovou zprávu“ jen s termínem do 7 dnů a jen jako `verified: false`
položku. Model proto vyřadil: kalifornský balík 30+ AI zákonů (podpis/veto do 30. 9.),
Excel COPILOT() (14. 9., vyšlo jen jako neověřená zpráva o týden dřív), Grok 4.7 (termín
posunut), Gemini Spark rollout („příští týden“). Přitom **kalendář nadcházejících
událostí** (vydání, účinnost, soudy, konference, kvartální výsledky) je informace, kterou
si čtenář nikde jinde v jedné větě nepřečte.

### 2.6 Formulaické intro

Každý den končí intro větou „Přinášíme dvě zprávy.“ / „We bring two news items.“ — počet
položek je vidět v appce, věta nese nulovou informaci a v tenké dny zní jako omluva.

### 2.7 Zbytečná režie v běhu

- Recept přikazuje **mazat** denní soubory starší 7 dnů. Model si k tomu vymyslel
  „scratchpad zálohování“ a několik dní řeší, že mu záloha chybí (deníky 18. a 19. 9.).
  Git historii nic nemaže; soubory mají ~5 kB.
- Denní prořezávání `published-log.json` na 30 dnů zkracuje dedup okno přesně tam, kde je
  potřeba (viz 2.1) a stojí čas.

### 2.8 Nepsaná pravidla

Model si pravidla domýšlí a pak je drží konzistentně, i když nejsou v receptu: „výpadky se
nepočítají jako zprávy podle zavedené praxe“ (4. 9.), ale 18. 9. výpadek Copilotu vyšel;
„pravidlo 72–80 h“; „recyklace“ pro zprávy, které v appce nikdy nevyšly. Recept musí být
v těchto bodech explicitní, jinak si každá session vyloží mlčení jinak.

## 3 · Co v appce chybí, aby obsah byl přínosnější

- Karta **neodlišuje tip od zprávy** (tip má jen kategorii Nástroje).
- Na kartě **není datum události** — čtenář neví, jestli jde o včerejšek nebo minulý týden.
- Chybí blok **„Proč na tom záleží“**.
- Chybí sekce **„Na obzoru“** (nadcházející termíny).
- Archiv drží **7 dnů**; odkazy `followsUp` starší 7 dnů nejsou klikací, ačkoli deníky
  je běžně přidávají (6. 9. → 28. 8., 5. 9. → 27. 8.).

## 4 · Rozhodnutí pro v3

| Oblast | v2 | v3 |
|---|---|---|
| Okno čerstvosti | ~72 h, tvrdá brána | **7 dnů**; priorita ≤ 48 h; starší jen jako `-update` |
| Dedup | published-log 30 dnů | published-log **60 dnů** (skutečná ochrana proti recyklaci) |
| Cíl položek | 8–12, „aspoň 8 zpráv“ | **6–10** zpráv + tipů, strop 12; pod 5 = WARN se zdůvodněním |
| Tipy | vzorec 12 − zprávy, strop 4, rotace témat tvrdá, okno 30 dnů | **0–3** denně z fronty, okno 60 dnů, rotace jen jako preference, nikdy opakovat |
| Ověřeno | ≥ 2 zdroje, ≥ 1 T1/T2 | **≥ 1 oficiální (T1)** nebo **≥ 2 různá média (T2)**; skript zná pozitivní seznamy domén, neznámá doména = WARN a do ověření se nepočítá |
| Obsah položky | title + summary + sources | + **`why`** (proč na tom záleží, 12–35 slov) + **`eventDate`** + `kind` (news/tip) |
| Výhled | jen „výhledová zpráva“ do 7 dnů | sekce **`radar`** 0–6 termínů do 30 dnů, přenáší se den ode dne, po datu končí nebo se stane zprávou |
| Intro | 1–2 věty, v praxi „Přinášíme N zpráv“ | 1 věta o tom, **čím den žije**; počítání položek skript zamítne |
| Rešerše | 14–24 dotazů, volně | **plán 20–30 dotazů** v pevných blocích (newsroomy · média · témata · tipy · radar) |
| Archiv / soubory | 7 dnů, starší soubory mazat | index **14 dnů**, soubory se **nemažou** |
| Deník | volný | pevná osnova: počty, rešerše, vyřazeno + proč, stav banku |

## 5 · Co se nemění

Nevymýšlet fakta, čísla ani URL; URL jen z výsledků dnešní rešerše; datum primární události
vždy ověřit; typografické uvozovky; žádné názvy dnů v týdnu; kontrola skriptem před
publikací, s FAILem se nepublikuje; jeden běh denně ve 3:00 UTC; Netlify denní commit
nenasazuje.

## 6 · Očekávaný dopad

Realistický odhad při stejném rozpočtu rešerše: **6–9 položek denně** (víkend a pondělí
díky 7dennímu oknu dorovnají čtvrteční a páteční dění, které dnes propadá), k tomu
**2–5 termínů na obzoru** a u každé položky věta, proč to čtenáře zajímá. Kvalita zdrojů
poroste tím, že „ověřeno“ už nemotivuje k hledání libovolného druhého webu.
