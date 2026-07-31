# Podklad: nová to-do appka na základech AIspressa

Tento dokument je **kompletní předávací podklad** pro nový projekt: osobní to-do
aplikaci, která převezme frontend, UI a technické základy z AIspressa
(https://aispresso.app). Nic z to-do appky se tu nevyvíjí — tohle je mapa,
co z AIspressa vytáhnout, co nechat ležet a na co si dát pozor.

**Jak dokument použít:** založ nový projekt (nová session, nový repozitář),
dej jí tento soubor a přístup k repu `vasekbrozka/AI-brief-app`
(větev `claude/daily-ai-brief-app-b1qq0p`). Session pak kopíruje soubory
přesně podle mapy níže.

**Stav požadavků:** bod 1 zadal Vašek (*PWA jen pro mě, private,
zabezpečená*), body 2–10 jsou domyšlené podle stylu AIspressa a toho, jak
Vašek pracuje — viz §8. Platí jako výchozí zadání; cokoli z toho jde před
startem jednou větou změnit.

---

## 1 · Technický profil AIspressa (co přebíráme)

| Vrstva | Volba | Poznámka |
|---|---|---|
| Build | Vite 5 + TypeScript 5 | `npm run dev / build / typecheck` |
| UI | React 18, žádný UI framework | vše vlastní, ~5 700 řádků |
| Styl | Jediný `src/index.css` (2 026 řádků) | design tokeny + komponenty, light/dark |
| PWA | `vite-plugin-pwa` 0.21 (autoUpdate) | manifest, service worker, offline |
| Stav | React Context providery + `localStorage` | žádný state management navíc |
| Hosting | Netlify (build z GitHubu) | SPA redirect, cache hlavičky |
| Ikony | `scripts/generate-icons.mjs` (sharp) | z jednoho zdroje všechny velikosti |

Bez backendu pro data (AIspresso čte obsah z GitHubu; to-do appka tohle
mít nebude — viz §6). Jediné serverové části jsou Netlify Functions pro push
notifikace — přenositelné, ale volitelné.

---

## 2 · Mapa souborů: co převzít, co nechat

### Převzít beze změny (jádro)

| Soubor | Co to je |
|---|---|
| `src/index.css` | **Celý design systém** — tokeny, karty, tlačítka, přepínače, tab bar, toasty, swipe, skeletony, empty-states, desktop layout (sidebar ≥900 px). Obsahové sekce (`.item`, `.streakcard`, `.gpop`, `.thread`…) se při úklidu smažou, základ zůstává. |
| `src/components/SwipeToReveal.tsx` | Obousměrný swipe na kartách (vpravo/vlevo akce) — axis-lock, rubber-band, flick, haptika. Pro to-do ideální: dokončit / smazat. |
| `src/components/Icon.tsx` | Inline SVG ikonky (check, share, bookmark, chevrony, settings…), snadno rozšiřitelné. |
| `src/components/TabBar.tsx` + `ScreenScaffold.tsx` | Spodní tab bar + hlavička obrazovky s back tlačítkem (vzor tab → podobrazovka). |
| `src/components/Switch.tsx`, `Segmented.tsx` | iOS-style přepínač a segmentový volič (světlo/tma/auto). |
| `src/components/Toaster.tsx` + `src/lib/toast.ts` | Toast hlášky („Uloženo ☕️") přes CustomEvent — bez závislostí. |
| `src/components/states.tsx` | Skeleton / error / empty stavy obrazovek. |
| `src/lib/haptics.ts` | Vibrace na interakce (mobil). |
| `src/lib/format.ts` | Datumové/textové helpery (relativní dny, formát datumu cs/en). |
| `src/providers/SettingsProvider.tsx` | Vzor nastavení: jazyk, téma (light/dark/auto přes `data-theme`), toggly, vše v localStorage. Osekat o obsahové volby. |
| `src/providers/NavProvider.tsx` | Mini-navigace mezi taby zvenčí. |
| `src/screens/SettingsScreen.tsx` + `AboutScreen.tsx` | Vzor Nastavení + O aplikaci (verze, release notes, jak instalovat) — struktura k převzetí, texty vyměnit. |
| `vite.config.ts` | PWA konfigurace — vyměnit název/manifest, **smazat** `runtimeCaching` pro GitHub a `importScripts: ['push-sw.js']` (pokud nebudou push). |
| `netlify.toml` | Vzít SPA redirect + cache hlavičky. **Smazat** `ignore` pravidlo (šetřilo deploye za denní obsah — to-do žádný denní obsah nemá) a sekci functions (pokud nebudou push). |
| `tsconfig*.json`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts` | Kostra projektu; v `main.tsx` vyměnit strom providerů. |
| `scripts/generate-icons.mjs` | Vygeneruje všechny PWA ikony z jednoho zdrojového obrázku (`npm run icons`). Nový projekt = nový zdrojový obrázek, jinak beze změny. |
| `.gitignore`, `package.json` | Závislosti štíhlé: react, react-dom + dev nástroje. `@netlify/blobs` a `web-push` jen pokud budou push notifikace. |

### Převzít jako vzor (přepsat obsah, zachovat tvar)

| Soubor | Vzor k zopakování |
|---|---|
| `src/providers/ReadProvider.tsx` (76 ř.) | **Kanonický vzor Provider + localStorage** — pro to-do bude `TasksProvider` stejného tvaru (viz §4). |
| `src/providers/SavedProvider.tsx` | Ukládání celých objektů do localStorage (to samé pro úkoly). |
| `src/App.tsx` | Přepínání tabů + podobrazovek (`aboutOpen`, …) se scroll-resetem. |
| `src/i18n/strings.ts` | Dvojjazyčný slovník. **Rozhodnout:** to-do jen pro tebe → nejspíš stačí čeština a celé i18n vyhodit (zjednodušení), nebo nechat vzor. |
| `src/screens/TodayScreen.tsx` + `components/BriefView.tsx` | Vzor „hlavní obrazovka = čistý seznam karet bez chromu". |
| `src/hooks/useClockTick.ts` | Překreslení při změně dne — pro to-do užitečné (termíny „dnes/zítra"). |

### Nechat v AIspressu (nekopírovat)

Obsahová logika briefů: `lib/briefs.ts`, `lib/types.ts` (BriefItem…),
`lib/categories.ts`, `lib/glossary.ts`, `lib/share.ts`, `hooks/useBrief.ts`,
`providers/{Glossary,Streak}Provider`, `components/{BriefItemCard, BriefView,
CategoryChip, SourceList, VerifiedBadge, WeekStreak, Glossary*}`,
`screens/{Archive,BriefDetail,Saved}Screen`, celý adresář `data/`,
`docs/brief-generation.md`, `docs/check-brief.py`, `public/push-sw.js`
a `netlify/functions/*` (pokud nebudou push notifikace).

Gamifikaci (streak) v to-do **nepřenášet rovnou** — ale `WeekStreak.tsx` je
hotový vzor, kdyby ses někdy rozhodl pro „splněno X dní po sobě".

---

## 3 · Design systém v kostce

Celý vizuál drží **CSS proměnné** v `src/index.css` — light je default,
dark přes `@media (prefers-color-scheme)` i vynucené `:root[data-theme]`.
Klíčové tokeny (light):

```css
--bg: #fbfbfd;          /* pozadí aplikace */
--surface: #ffffff;      /* karty */
--hairline: rgba(0,0,0,.07);  /* vlasové linky místo rámečků */
--text: #1d1d1f;  --text-secondary: #55555b;  --text-tertiary: #8a8a8f;
--accent: #0071e3;       /* JEDINÉ místo, kde se mění barva značky */
--radius: 18px;  --radius-sm: 12px;
--content-max: 620px;    /* šířka sloupce obsahu */
--tabbar-height: 54px;
```

Principy, které dělají ten „AIspresso pocit":
- systémový font (SF Pro / -apple-system), žádné webfonty;
- bílé karty s `--shadow-sm` na šedavém pozadí, vlasové oddělovače;
- průsvitná chrome (`--nav-bg` + backdrop-filter) nahoře i dole;
- obsah má spodní padding ~82 px, aby nikdy nekončil pod tab barem;
- desktop ≥900 px: obsah ve sloupci, navigace v levém sidebaru;
- animace krátké (~220 ms), respektuje se `prefers-reduced-motion`;
- akcentová barva se pro novou appku klidně vymění za jinou — jedna proměnná
  (`--accent` + dark varianta + odvozené `--accent-soft-*`).

---

## 4 · Ověřené vzory (zopakovat 1:1)

**Provider + localStorage** — celý stav aplikace žije v malých context
providerech, každý si sám čte/píše svůj klíč. Kostra pro úkoly:

```tsx
const KEY = 'todo.tasks';

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
    catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  }, [tasks]);
  // add / toggle / remove / edit … přes useCallback
  return <Ctx.Provider value={…}>{children}</Ctx.Provider>;
}
```

- klíče prefixovat názvem appky (`todo.*`), verzovat migrace markerem
  (vzor `HIDE_READ_DEFAULTED_KEY` v SettingsProvideru);
- mazání/označení karty: krátká exit animace, pak změna stavu
  (vzor `EXIT_MS = 220` v BriefItemCard);
- swipe akce: `SwipeToReveal` s `right`/`left` akcí (pro to-do: dokončit /
  smazat či odložit);
- tab bar: 2–3 taby úplně stačí (např. Dnes · Vše · Nastavení), podobrazovky
  stavem v `App.tsx`, ne routerem — appka nemá URL navigaci a nevadí to;
- verze + release notes v `AboutScreen` (`APP_VERSION`) — drž od 1.0.

---

## 5 · PWA checklist pro nový projekt

1. `vite.config.ts`: nový `name/short_name/description`, `theme_color` =
   `--bg`, `display: 'standalone'`, ikony 192/512/maskable.
2. `npm run icons` s novým zdrojovým obrázkem (script přebrat).
3. `registerType: 'autoUpdate'` — appka se sama aktualizuje při otevření;
   `sw.js` s `max-age=0` (hlavička v netlify.toml), assets `immutable`.
4. **Smazat** runtimeCaching na GitHub API a `importScripts` (AIspresso
   specifika). Pro čistě lokální to-do není potřeba žádný runtime caching —
   precache zvládne offline start celé appky.
5. iOS: instalace přes Sdílet → Přidat na plochu; `apple-touch-icon`
   generuje script; badge na ikoně funguje jen přes push (viz §6).
6. Otestovat: Lighthouse PWA, offline start, chování po deploy nové verze.

---

## 6 · „Private a zabezpečená" — architektury (pro v1 rozhodnuto: A)

Bod 1 požadavků. Dvě architektury, každá řeší „zabezpečení" jinak:

**A · Čistě lokální (doporučený start).** Úkoly jen v zařízení
(localStorage), žádný server, žádný účet. „Zámek" = PIN brána v appce
(volitelně WebAuthn/biometrie přes `navigator.credentials`). Hosting může
být veřejná URL s neuhodnutelnou adresou — data na serveru nejsou žádná,
takže není co ukrást. Zero cost, hotové rychle. Limity: úkoly nejsou na
druhém zařízení; smazání dat Safari = ztráta (zmírnit exportem do souboru
v Nastavení — snadné přidat).

**B · Se synchronizací a přihlášením.** Úkoly v cloudu, skutečná
autentizace. Rozumné cesty:
- **Supabase** (auth + Postgres, free tier) — přihlášení e-mailem, data za
  RLS pravidly; nejčistší „opravdové" řešení, ale nový pohyblivý díl;
- **Cloudflare Pages + Cloudflare Access** (free do 50 uživatelů) — celá
  appka schovaná za Google login ještě před načtením; jednoduché a solidní,
  hosting se ale stěhuje z Netlify;
- Netlify sám o sobě: password-protection je v placeném tarifu a Netlify
  Identity je pro nové weby utlumené — pro variantu B Netlify nedoporučuji.

**Rozhodnutí pro v1:** varianta **A** (odpovídá duchu AIspressa: jednoduché,
bez backendu, zadarmo) + export dat v Nastavení — **rozšířená o soukromý
Inbox plněný Claudem** (§7). Na **B** přejít, až syncing reálně chybět
začne — UI vrstva se přitom nemění.

---

## 7 · Obsah plní Claude: Plaud → úkoly (klíčová novinka zadání)

Vašek nosí **Plaud notetaker** (nahrává porady a hlasové poznámky) a Plaud
má nově **MCP integraci na Claude**. Úkoly tedy nebude zadávat hlavně ručně —
poteče to takto:

```
Plaud nahrávka → Claude session (Plaud MCP) vytěží action itemy
  → zapíše je do souboru v SOUKROMÉM GitHub repu (push zdarma, bez deploye)
  → appka si soubor stáhne → úkoly přistanou v Inboxu → ťuknutím přijmeš
```

Je to **tentýž vzor jako AIspresso** (Claude commituje obsah, appka čte
z GitHubu, Netlify se nenasazuje), jen v soukromém provedení:

- **Soukromé repo.** Úkoly z porad jsou citlivé → repo musí být private.
  Appka je čte přes GitHub Contents API s **fine-grained tokenem jen pro
  čtení jednoho repa** (kód na čtení je v AIspressu hotový — `lib/briefs.ts`
  používá Contents API, přidá se jen Authorization hlavička). Token se zadá
  jednou v Nastavení a žije za PIN zámkem; kdyby unikl, umí jen číst seznam
  úkolů a dá se zneplatnit.
- **Inbox, ne sync.** Claude do repa jen **přidává návrhy úkolů** (append,
  se zdrojem: „z porady s X, 31. 7."). Tvůj skutečný seznam žije dál lokálně
  v zařízení. Nový návrh v Inboxu ťuknutím přijmeš (stane se lokálním
  úkolem), nebo zahodíš. Claude nikdy nepotřebuje vědět, co máš hotovo —
  žádný obousměrný sync, žádné konflikty. (Zrcadlí vzor obsah z GitHubu +
  lokální read-state z AIspressa.)
- **Úklid inboxu:** automatika při každém běhu smaže návrhy starší ~14 dní
  (jsou to návrhy, ne archiv); appka si lokálně drží seznam zahozených id.
- **Automatika:** běh podle AIspresso playbooku — recept v `docs/` nového
  repa (co je action item, jak formulovat úkol, dedup proti už navrženým),
  naplánovaný večerní trigger, malý validátor JSON před pushem.
- ⚠️ **Ověřit při stavbě:** dostupnost Plaud MCP konektoru v naplánovaných
  (headless) bězích — interaktivně přihlašované konektory v nich někdy
  nejsou k dispozici. Fallback: běh na pokyn („vytěž dnešek") nebo export
  z Plaudu souborem. Tohle je jediné technické riziko celé linky.

Ruční zadání (požadavek 2) zůstává vedle toho beze změny — Inbox je hlavní
přítok, ne jediný.

Push notifikace/badge: AIspresso má hotový vzor (`public/push-sw.js`,
`netlify/functions/push-*`, web-push VAPID) — přenositelné, ale chce Netlify
Functions a Blobs. Pro to-do volitelné („připomeň úkol") — rozhodnout.

---

## 7b · Co bude nové (jen rámec, nevyvíjet tady)

- **Datový model:** `Task { id, title, note?, due?, repeat?, done, doneAt?,
  created, source? }` — `source` nese původ z Plaudu („porada s X, 31. 7.");
  držet ploché a malé, jako BriefItem.
- **Obrazovky (náčrt):** Dnes (úkoly na dnešek + po termínu, nahoře pruh
  „nové v Inboxu") · Vše · Nastavení (téma, zámek, gamifikace, token,
  export). Přidávání: plovoucí tlačítko + jeden řádek vstupu.
- **Interakce:** tap = detail/edit, checkbox vlevo (vzor read-toggle),
  swipe vpravo = hotovo, swipe vlevo = smazat/odložit; v Inboxu
  přijmout/zahodit.

---

## 8 · Požadavky (bod 1 od Vaška, body 2–10 domyšlené)

1. **PWA jen pro mě, private, zabezpečená** — lokální data + PIN/biometrický
   zámek při otevření, export zálohy v Nastavení (architektura A, §6).
2. **Bleskové zadání** — jeden řádek, povinný jen název; nový úkol do pár
   sekund, žádné povinné kolonky ani formuláře.
3. **Malé konkrétní řešení** — plochý seznam + pohled Dnes; žádné projekty,
   štítky, priority ani kanban. Stejná filozofie jako AIspresso: radši méně.
4. **Termíny nalehko** — volitelné datum (dnes · zítra · vybrat); úkoly po
   termínu viditelně nahoře v Dnes. Bez časů, bez napojení na kalendář.
5. **Jednoduché opakování** — volitelně „po dokončení znovu za den / týden /
   měsíc". Nic složitějšího.
6. **Gesta jako v AIspressu** — swipe vpravo = hotovo, swipe vlevo =
   smazat/odložit; haptika; krátká exit animace (~220 ms).
7. **Jen česky** — i18n vrstva se nepřenáší, texty přímo v komponentách
   nebo jednom souboru konstant.
8. **Volitelná gamifikace** — řada dní „vše odškrtnuto" ve stylu WeekStreak;
   ve výchozím stavu zapnutá, vypínatelná v Nastavení (jako v AIspressu).
9. **Nulové provozní náklady** — Netlify free tier, žádný backend; v1 bez
   push připomínek (hotový vzor v AIspressu existuje, přidat jde později).
10. **Stejný pocit jako AIspresso** — design systém beze změny; odlišit jen
    akcentovou barvou (návrh: zelená, v tokenech už je `--verified`)
    a vlastní ikonou. iPhone především, desktop layout zachovat.
11. **Obsah plní Claude z Plaudu** — action itemy z nahrávek přes Plaud MCP
    tečou do Inboxu appky (soukromé repo + read-only token, §7); ruční
    zadání zůstává vedle toho. Přijetí/zahození návrhu jedním ťuknutím.

**Návrhy k potvrzení (snadno změnitelné):** název **Ristretto** (malé,
koncentrované — sedí k to-do i do kávové rodiny vedle AIspressa; náhradníci:
Doppio, Hotovka), zelený akcent, Netlify subdoména stačí.

---

*Vytvořeno 31. 7. 2026 nad stavem AIspressa v1.5 (větev
`claude/daily-ai-brief-app-b1qq0p`). Čísla řádků a seznam souborů odpovídají
tomuto dni; kdyby se AIspresso mezitím vyvinulo, mapa souborů platí dál —
jen si nová session ověří aktuální stav repa.*
