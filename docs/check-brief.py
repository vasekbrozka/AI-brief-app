#!/usr/bin/env python3
"""Kontrola před publikací denního AIspresso briefu (schéma v3).

Použití (z kořene repa):
  python3 docs/check-brief.py [YYYY-MM-DD]       # dnešní (UTC) nebo zadaný den — vše včetně ledgerů
  python3 docs/check-brief.py --file CESTA.json  # jen schéma a texty souboru (bez indexu a ledgerů)
  python3 docs/check-brief.py --stats [N]        # čísla za posledních N dnů (výchozí 14) do deníku

FAIL = nepublikovat, oprav a spusť znovu.  WARN = posuď a rozhodni (důvod do deníku).
Exit kód 0 = vše OK (warny povolené), 1 = aspoň jeden FAIL.
"""
import json
import re
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

BRIEFS = Path("data/briefs")
CATEGORIES = {"models", "research", "business", "tools", "policy", "opensource"}
KINDS = {"news", "tip"}

# Od tohoto dne platí schéma v3 (why, eventDate, kind, radar). Starší briefy se kontrolují
# jen podle pravidel v2, aby se dal skript pustit i na archiv.
V3_FROM = "2026-09-20"

# --- meze (zrcadlí docs/brief-generation.md) ---------------------------------
NEWS_AGE_OK = 7        # dny: eventDate zprávy v okně
NEWS_AGE_HARD = 9      # 8–9 = WARN, 10+ = FAIL
TIP_AGE_OK = 60        # dny: stáří funkce u tipu
TIP_AGE_HARD = 75
RADAR_DAYS_OK = 30     # dny dopředu
RADAR_DAYS_HARD = 90
RADAR_MAX_OK = 6
RADAR_MAX_HARD = 8
ITEMS_MAX = 12
ITEMS_MIN_WARN = 5
TIPS_MAX = 3
INDEX_MAX_DAYS = 14
FOLLOWSUP_WINDOW = 14
PUBLOG_KEEP_DAYS = 60
PUBLOG_STALE_WARN_DAYS = 75
WEEK_MIN, WEEK_MAX, WEEK_HARD = 4, 6, 8   # weekInReview (nedělní brief)
WEEK_NOTE_WORDS_OK, WEEK_NOTE_WORDS_HARD = 25, 35
DUP_TITLE_SIMILARITY = 0.5   # Jaccard přes slova titulků; víc = WARN „možná duplicita“
GLOSSARY = Path("data/glossary.json")
GLOSSARY_MAX_NEW_PER_DAY = 3

# Kanonická jména zdrojů (pole `name`) pro nejčastější domény — viz recept, sekce Psaní.
CANONICAL_NAMES = {
    "anthropic.com": "Anthropic", "claude.com": "Anthropic", "support.claude.com": "Anthropic",
    "code.claude.com": "Anthropic", "openai.com": "OpenAI", "help.openai.com": "OpenAI",
    "blog.google": "Google", "deepmind.google": "DeepMind", "googleblog.com": "Google",
    "microsoft.com": "Microsoft", "learn.microsoft.com": "Microsoft Learn",
    "nvidia.com": "NVIDIA", "ai.meta.com": "Meta", "huggingface.co": "Hugging Face",
    "mistral.ai": "Mistral", "x.ai": "xAI", "apple.com": "Apple",
    "reuters.com": "Reuters", "apnews.com": "AP", "bloomberg.com": "Bloomberg",
    "theverge.com": "The Verge", "arstechnica.com": "Ars Technica", "techcrunch.com": "TechCrunch",
    "axios.com": "Axios", "wired.com": "Wired", "theregister.com": "The Register",
    "technologyreview.com": "MIT Technology Review", "cnbc.com": "CNBC",
    "theinformation.com": "The Information", "ft.com": "Financial Times",
    "wsj.com": "Wall Street Journal", "nytimes.com": "The New York Times",
    "washingtonpost.com": "The Washington Post", "theguardian.com": "The Guardian",
    "bbc.com": "BBC", "bbc.co.uk": "BBC", "npr.org": "NPR", "fortune.com": "Fortune",
    "venturebeat.com": "VentureBeat",
}

# --- zdroje: tiery důvěryhodnosti (viz recept, sekce Zdroje) ------------------
# Tier 1 = oficiální/primární. Shoda = doména nebo její subdoména.
T1_DOMAINS = [
    "anthropic.com", "claude.com", "claude.ai",
    "openai.com", "chatgpt.com",
    "google.com", "blog.google", "deepmind.google", "ai.google", "googleblog.com", "google.dev",
    "microsoft.com", "github.blog",
    "nvidia.com", "meta.com", "fb.com", "huggingface.co", "mistral.ai", "x.ai",
    "perplexity.ai", "amazon.com", "aboutamazon.com", "apple.com", "deepseek.com",
    "qwen.ai", "alibabacloud.com", "cohere.com", "stability.ai", "cursor.com",
    "cloudflare.com", "salesforce.com", "oracle.com", "ibm.com", "intel.com", "amd.com",
    "samsung.com", "metr.org", "darioamodei.com", "blog.samaltman.com",
    "courtlistener.com",
]
T1_SUFFIXES = [".gov", ".gov.uk", "europa.eu"]
# Tier 2 = reputabilní média.
T2_DOMAINS = [
    "reuters.com", "apnews.com", "bloomberg.com", "ft.com", "wsj.com", "nytimes.com",
    "washingtonpost.com", "theverge.com", "arstechnica.com", "techcrunch.com", "wired.com",
    "theregister.com", "technologyreview.com", "axios.com", "cnbc.com", "theinformation.com",
    "semafor.com", "politico.com", "politico.eu", "npr.org", "bbc.com", "bbc.co.uk",
    "theguardian.com", "fortune.com", "venturebeat.com", "zdnet.com", "engadget.com",
    "9to5google.com", "9to5mac.com", "macrumors.com", "thehill.com", "businessinsider.com",
    "forbes.com", "nature.com", "science.org", "geekwire.com", "siliconangle.com",
    "windowscentral.com", "androidauthority.com", "androidpolice.com", "tomshardware.com",
    "tomsguide.com", "techradar.com", "pcmag.com", "cnet.com", "404media.co",
    "spectrum.ieee.org", "qz.com", "thenextweb.com", "bleepingcomputer.com",
    "securityweek.com", "nbcnews.com", "cbsnews.com", "abcnews.go.com", "latimes.com",
    "sfchronicle.com", "economist.com", "time.com", "theatlantic.com", "newyorker.com",
    "vox.com", "scmp.com", "nikkei.com", "calmatters.org", "statnews.com",
    "seznamzpravy.cz", "irozhlas.cz", "ceskatelevize.cz", "lupa.cz", "ihned.cz", "hn.cz",
    "e15.cz", "denikn.cz",
]
# Paywall: smí být citován jen v páru s volně čitelným zdrojem.
PAYWALLED_DOMAINS = ["bloomberg.com", "ft.com", "wsj.com", "theinformation.com",
                     "economist.com", "nytimes.com"]
# Nikdy jako citovaný zdroj (agregátory, sociální sítě, blogové platformy, farmy).
BANNED_SOURCE_DOMAINS = [
    "unrot.co", "buildfastwithai.com", "releasebot.io", "aitoolsrecap.com",
    "aiapps.com", "crescendo.ai", "medium.com", "substack.com",
    "news.ycombinator.com", "reddit.com", "x.com", "twitter.com",
    "facebook.com", "linkedin.com", "youtube.com", "techbuzz.ai",
    "the-agent-report.com", "tech-reader.blog", "techstartups.com",
    "dentro.de", "llm-stats.com", "marktechpost.com", "digitalapplied.com",
    "msn.com", "wikipedia.org",
]

WEEKDAYS = [
    "pondělí", "pondělk", "úterý", "úterk", "středa", "středu", "středy",
    "středě", "čtvrtek", "čtvrtk", "pátek", "pátku", "pátky", "sobota",
    "sobotu", "soboty", "sobotě", "neděle", "neděli", "nedělí",
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
]
CALQUES = ["jádrové nástroje", "jádrových nástrojů", "jádrovým nástrojům", "jádrovými nástroji"]

QUIZ_COUNT = 3   # otázek v kvízu dne; přesně 3 možnosti na otázku
# Konkrétní datum ve shrnutí („16. září" / „September 16").
CS_MONTHS = "ledna|února|března|dubna|května|června|července|srpna|září|října|listopadu|prosince"
EN_MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December"
DATE_IN_TEXT = {
    "cs": re.compile(rf"\b\d{{1,2}}\.\s?({CS_MONTHS})\b"),
    "en": re.compile(rf"\b({EN_MONTHS})\s+\d{{1,2}}\b|\b\d{{1,2}}\s+({EN_MONTHS})\b"),
}
ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

fails: list[str] = []
warns: list[str] = []
infos: list[str] = []


def fail(msg: str) -> None:
    fails.append(msg)


def warn(msg: str) -> None:
    warns.append(msg)


def words(text: str) -> int:
    return len((text or "").split())


def loc(obj: dict, field: str, lang: str) -> str:
    v = obj.get(field)
    if isinstance(v, dict):
        return str(v.get(lang, "") or "")
    return ""


def parse_iso(s: str) -> date | None:
    if not isinstance(s, str) or not ISO_DATE.match(s):
        return None
    try:
        return date.fromisoformat(s)
    except ValueError:
        return None


def domain_of(url: str) -> str:
    m = re.match(r"https?://([^/]+)", url)
    return (m.group(1) if m else "").lower().removeprefix("www.")


def _matches(domain: str, entries: list[str]) -> bool:
    return any(domain == d or domain.endswith("." + d) for d in entries)


def tier_of(domain: str) -> int:
    if _matches(domain, T1_DOMAINS) or any(domain.endswith(s) for s in T1_SUFFIXES):
        return 1
    if _matches(domain, T2_DOMAINS):
        return 2
    return 3


def canonical_name(domain: str) -> str | None:
    """Nejdelší odpovídající klíč (subdoména má přednost před doménou)."""
    best = None
    for d, name in CANONICAL_NAMES.items():
        if (domain == d or domain.endswith("." + d)) and (best is None or len(d) > len(best[0])):
            best = (d, name)
    return best[1] if best else None


def load_brief_file(d: date) -> dict | None:
    try:
        return json.load(open(BRIEFS / f"{d.isoformat()}.json", encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def title_tokens(text: str) -> set[str]:
    return {w for w in re.findall(r"[\w]+", (text or "").lower()) if len(w) > 3}


def jaccard(a: set[str], b: set[str]) -> float:
    return len(a & b) / len(a | b) if a and b else 0.0


def stats(days: int) -> int:
    """Tabulka posledních N dnů pro redakční deník (jen existující soubory)."""
    today = date.fromisoformat(datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    rows = []
    for k in range(days):
        d = today - timedelta(days=k)
        b = load_brief_file(d)
        if not b:
            continue
        items = b.get("items", [])
        news = [i for i in items if "-tip-" not in i.get("id", "")]
        tips = len(items) - len(news)
        verified = sum(1 for i in items if i.get("verified") is True)
        src = [domain_of(s.get("url", "")) for i in items for s in i.get("sources", [])]
        weak = sum(1 for d_ in src if tier_of(d_) == 3)
        rows.append((d.isoformat(), len(items), len(news), tips, len(b.get("radar") or []),
                     verified, len(items), weak, len(src)))
    if not rows:
        print("žádné briefy k dispozici")
        return 0
    print(f"{'den':<12}{'položek':>8}{'zpráv':>7}{'tipů':>6}{'radar':>7}{'ověřeno':>10}{'slabé zdroje':>14}")
    for d, n, nn, nt, nr, v, tot, weak, ns in rows:
        print(f"{d:<12}{n:>8}{nn:>7}{nt:>6}{nr:>7}{v:>4}/{tot:<5}{weak:>6}/{ns:<7}")
    n = len(rows)
    avg = lambda idx: sum(r[idx] for r in rows) / n
    tot_items = sum(r[1] for r in rows)
    tot_src = sum(r[8] for r in rows)
    print(f"\nprůměr za {n} dnů: {avg(1):.1f} položek · {avg(2):.1f} zpráv · {avg(3):.1f} tipů · "
          f"{avg(4):.1f} na obzoru · ověřeno {100 * sum(r[5] for r in rows) / max(1, tot_items):.0f} % · "
          f"slabé zdroje {100 * sum(r[7] for r in rows) / max(1, tot_src):.0f} %")
    return 0


def check_text(name: str, text: str, lang: str) -> None:
    low = (text or "").lower()
    for d in WEEKDAYS:
        if d in low:
            fail(f"{name}: obsahuje název dne v týdnu („{d}“) — použij konkrétní datum")
            break
    if '"' in (text or ""):
        fail(f"{name}: obsahuje ASCII uvozovku — použij typografické „“ (CZ) / ‘’ (EN)")
    if lang == "cs":
        for c in CALQUES:
            if c in low:
                fail(f"{name}: kalk „{c}“ — vyjmenuj nástroje, nebo napiš „hlavní nástroje“")
                break


def check_sources(owner: str, srcs, lo: int, hi: int) -> tuple[list[int], list[str]]:
    """Vrátí tiery a domény citovaných zdrojů; hlásí formát, zákazy a paywall."""
    tiers: list[int] = []
    domains: list[str] = []
    if not isinstance(srcs, list) or not lo <= len(srcs) <= hi:
        fail(f"{owner}: {len(srcs) if isinstance(srcs, list) else '?'} zdrojů (povoleno {lo}–{hi})")
        srcs = srcs if isinstance(srcs, list) else []
    for s in srcs:
        url = s.get("url", "") if isinstance(s, dict) else ""
        if not isinstance(s, dict) or not s.get("name", "").strip():
            fail(f"{owner}: zdroj bez name")
        if not url.startswith("http"):
            fail(f"{owner}: neplatné URL {url!r}")
            continue
        d = domain_of(url)
        domains.append(d)
        canon = canonical_name(d)
        if canon and s.get("name", "").strip() != canon:
            warn(f"{owner}: zdroj {d} má name {s.get('name')!r}, kanonicky „{canon}“")
        if _matches(d, BANNED_SOURCE_DOMAINS):
            fail(f"{owner}: zakázaná doména ve zdrojích ({d})")
            tiers.append(3)
            continue
        t = tier_of(d)
        tiers.append(t)
        if t == 3:
            warn(f"{owner}: zdroj {d} není v seznamu T1/T2 — do ověření se nepočítá; "
                 f"když rešerše dala T1/T2 URL, použij ji")
    pay = [d for d in domains if _matches(d, PAYWALLED_DOMAINS)]
    free = [d for d in domains if d not in pay]
    if pay and not free:
        fail(f"{owner}: jen paywallové zdroje ({pay}) — přidej volně čitelný")
    return tiers, domains


def verification_ok(tiers: list[int], domains: list[str]) -> bool:
    t1 = sum(1 for t in tiers if t == 1)
    t2 = {d for d, t in zip(domains, tiers) if t == 2}
    return t1 >= 1 or len(t2) >= 2


def main() -> int:
    argv = sys.argv[1:]
    file_mode = False
    brief_path: Path
    if argv and argv[0] == "--stats":
        return stats(int(argv[1]) if len(argv) > 1 else 14)
    if argv and argv[0] == "--file":
        if len(argv) < 2:
            print("použití: check-brief.py --file CESTA.json")
            return 2
        file_mode = True
        brief_path = Path(argv[1])
        today_str = None
    else:
        today_str = argv[0] if argv else datetime.now(timezone.utc).strftime("%Y-%m-%d")
        brief_path = BRIEFS / f"{today_str}.json"

    # --- načtení souborů -------------------------------------------------
    try:
        brief = json.load(open(brief_path, encoding="utf-8"))
    except FileNotFoundError:
        fail(f"chybí {brief_path}")
        return report()
    except json.JSONDecodeError as e:
        fail(f"{brief_path} není platný JSON: {e}")
        return report()

    if file_mode:
        today_str = str(brief.get("date", ""))
        infos.append(f"režim --file: kontrola schématu a textů {brief_path}; index a ledgery se přeskakují")
    today = parse_iso(today_str)
    if today is None:
        fail(f"brief.date {today_str!r} není platné ISO datum")
        return report()
    v3 = today_str >= V3_FROM
    if not v3:
        infos.append(f"brief je z doby před {V3_FROM} — pole why/eventDate/kind/radar se nevyžadují")

    index = backlog = publog = None
    if not file_mode:
        try:
            index = json.load(open(BRIEFS / "index.json", encoding="utf-8"))
        except Exception as e:
            fail(f"index.json nejde načíst: {e}")
            return report()
        try:
            backlog = json.load(open(BRIEFS / "tips-backlog.json", encoding="utf-8"))
        except Exception as e:
            fail(f"tips-backlog.json nejde načíst: {e}")
            backlog = {"tips": []}
        try:
            publog = json.load(open(BRIEFS / "published-log.json", encoding="utf-8"))
        except Exception as e:
            fail(f"published-log.json nejde načíst: {e}")
            publog = {"published": []}

    items = brief.get("items", [])
    if not isinstance(items, list):
        fail("items musí být pole")
        return report()
    for i in items:
        if not isinstance(i, dict) or not isinstance(i.get("id"), str):
            fail("položka bez textového id")
            return report()
    tips = [i for i in items if "-tip-" in i["id"]]
    news = [i for i in items if "-tip-" not in i["id"]]

    # --- základní tvar ----------------------------------------------------
    if brief.get("date") != today_str:
        fail(f"brief.date = {brief.get('date')}, čekáno {today_str}")
    if brief.get("sample") is not False:
        fail("sample musí být false")
    for lang in ("cs", "en"):
        if not loc(brief, "headline", lang).strip():
            fail(f"headline.{lang} je prázdný")
        hl_words = words(loc(brief, "headline", lang))
        if hl_words > 12:
            fail(f"headline.{lang} má {hl_words} slov (tvrdý strop 12)")
        elif hl_words > 9:
            warn(f"headline.{lang} má {hl_words} slov (cíl ≤ 9)")
    if v3 and brief.get("intro") is not None:
        warn("brief má intro — appka ho od v3.2 nezobrazuje, pole vynech")

    if not items:
        fail("brief nemá žádné položky")
    if len(items) > ITEMS_MAX:
        fail(f"{len(items)} položek (tvrdý strop {ITEMS_MAX})")
    elif len(items) < ITEMS_MIN_WARN:
        warn(f"{len(items)} položek (cíl 6–10) — zdůvodni v redakčním deníku, co jsi prošel")

    highlights = [i["id"] for i in items if i.get("highlight")]
    if len(highlights) != 1:
        fail(f"highlight musí být právě 1, je {len(highlights)}: {highlights}")
    if any("-tip-" in h for h in highlights):
        fail(f"highlight nesmí být tip: {highlights}")

    ids = [i["id"] for i in items]
    if len(set(ids)) != len(ids):
        fail("duplicitní id položek")
    for i in items:
        if not i["id"].startswith(today_str):
            fail(f"id {i['id']} nezačíná dnešním datem")
        if i.get("category") not in CATEGORIES:
            fail(f"{i['id']}: neplatná kategorie {i.get('category')!r}")
        if i.get("verified") not in (True, False):
            fail(f"{i['id']}: verified musí být true/false")
        is_tip = "-tip-" in i["id"]
        kind = i.get("kind", "news")
        if kind not in KINDS:
            fail(f"{i['id']}: kind musí být news nebo tip (je {kind!r})")
        elif v3 and is_tip != (kind == "tip"):
            fail(f"{i['id']}: kind={kind!r} neodpovídá id (tip má id s „-tip-“ a kind \"tip\")")

    # --- texty -------------------------------------------------------------
    for lang in ("cs", "en"):
        check_text(f"headline.{lang}", loc(brief, "headline", lang), lang)

    for i in items:
        is_tip = "-tip-" in i["id"]
        for lang in ("cs", "en"):
            title = loc(i, "title", lang)
            summary = loc(i, "summary", lang)
            why = loc(i, "why", lang)
            for field, text in (("title", title), ("summary", summary), ("why", why)):
                check_text(f"{i['id']}.{field}.{lang}", text, lang)
            if not title.strip():
                fail(f"{i['id']}: chybí title.{lang}")
            elif title.lower().startswith("tip"):
                fail(f"{i['id']}: titulek nesmí začínat slovem „tip“")
            elif words(title) > 14:
                warn(f"{i['id']}.title.{lang}: {words(title)} slov (cíl ≤ 9)")
            lo, hi = (25, 55) if is_tip else (30, 60)
            n = words(summary)
            if not lo <= n <= hi:
                fail(f"{i['id']}.summary.{lang}: {n} slov (tvrdé meze {lo}–{hi})")
            elif not is_tip and not 35 <= n <= 55:
                warn(f"{i['id']}.summary.{lang}: {n} slov (cíl 35–55)")
            if not is_tip and summary and not DATE_IN_TEXT[lang].search(summary):
                warn(f"{i['id']}.summary.{lang}: nemá konkrétní datum události (např. „16. září“)")
            if v3:
                if not why.strip():
                    fail(f"{i['id']}: chybí why.{lang} (proč se to čtenáře týká / jak to vyzkoušet)")
                else:
                    w = words(why)
                    if not 8 <= w <= 40:
                        fail(f"{i['id']}.why.{lang}: {w} slov (tvrdé meze 8–40)")
                    elif not 12 <= w <= 35:
                        warn(f"{i['id']}.why.{lang}: {w} slov (cíl 12–35)")
                    if why.strip().lower().startswith(("proč", "why")):
                        warn(f"{i['id']}.why.{lang}: nezačínej nadpisem „Proč…“ — appka ho přidá sama")
                    if why.strip() == summary.strip():
                        fail(f"{i['id']}.why.{lang}: je kopií shrnutí")
            elif why.strip():
                infos.append(f"{i['id']}: má why už před {V3_FROM} — v pořádku")

    # --- eventDate ------------------------------------------------------------
    for i in items:
        is_tip = "-tip-" in i["id"]
        ed_raw = i.get("eventDate")
        if ed_raw is None:
            if v3:
                fail(f"{i['id']}: chybí eventDate (datum primární události)")
            continue
        ed = parse_iso(str(ed_raw))
        if ed is None:
            fail(f"{i['id']}: eventDate {ed_raw!r} není platné ISO datum")
            continue
        age = (today - ed).days
        if age < 0:
            fail(f"{i['id']}: eventDate {ed_raw} je v budoucnosti — výhledy patří do radaru")
        elif is_tip:
            if age > TIP_AGE_HARD:
                fail(f"{i['id']}: funkce je {age} dní stará (tip max {TIP_AGE_OK}, tvrdý strop {TIP_AGE_HARD})")
            elif age > TIP_AGE_OK:
                warn(f"{i['id']}: funkce je {age} dní stará (tip cíl ≤ {TIP_AGE_OK}) — posuď, jestli je pořád nová")
        else:
            if age > NEWS_AGE_HARD:
                fail(f"{i['id']}: událost je {age} dní stará (okno {NEWS_AGE_OK} dní) — "
                     f"jako update dej eventDate nového vývoje, jinak ven")
            elif age > NEWS_AGE_OK:
                warn(f"{i['id']}: událost je {age} dní stará (okno {NEWS_AGE_OK} dní) — zdůvodni v deníku")

    # --- zdroje a ověření --------------------------------------------------------
    tier_counts = {1: 0, 2: 0, 3: 0}
    for i in items:
        tiers, domains = check_sources(i["id"], i.get("sources", []), 1, 3)
        for t in tiers:
            tier_counts[t] += 1
        if i.get("verified") is True:
            if v3 and not verification_ok(tiers, domains):
                fail(f"{i['id']}: verified:true vyžaduje ≥1 oficiální zdroj (T1) nebo ≥2 různá média (T2) — "
                     f"zdroje: {domains}")
            elif not v3 and len(domains) < 2:
                fail(f"{i['id']}: verified:true vyžaduje ≥2 zdroje (pravidlo v2)")

    # --- tipy ----------------------------------------------------------------
    if len(tips) > TIPS_MAX:
        fail(f"{len(tips)} tipů (strop {TIPS_MAX})")
    if tips and news and len(tips) > len(news):
        warn(f"{len(tips)} tipů při {len(news)} zprávách — tipy doplňují, nenahrazují")
    for t in tips:
        if t.get("category") != "tools":
            fail(f"{t['id']}: tip musí mít category tools")
    if backlog is not None:
        bl = {t.get("slug"): t for t in backlog.get("tips", []) if isinstance(t, dict)}
        for t in tips:
            slug = t["id"].removeprefix(f"{today_str}-")
            if slug not in bl:
                fail(f"{t['id']}: tip chybí v tips-backlog.json")
            elif bl[slug].get("used") != today_str:
                fail(f"{t['id']}: v backlogu nemá used={today_str}")
        tip_themes = [bl[t["id"].removeprefix(f"{today_str}-")].get("theme") for t in tips
                      if t["id"].removeprefix(f"{today_str}-") in bl]
        if len(tip_themes) != len(set(tip_themes)):
            warn(f"opakované téma tipů v jednom briefu: {tip_themes}")
        waiting = {}
        for tt in backlog.get("tips", []):
            if isinstance(tt, dict) and tt.get("used") is None:
                waiting[tt.get("theme")] = waiting.get(tt.get("theme"), 0) + 1
        infos.append("bank tipů čeká: " + (", ".join(f"{k} {v}" for k, v in sorted(waiting.items())) or "nic"))

    # --- tipy: žádné opakování (published-log nese i tipy) ----------------------
    if publog is not None:
        tip_slug_re = re.compile(r"^(\d{4}-\d{2}-\d{2})-(tip-.+)$")
        prior_tip_use: dict[str, str] = {}
        for e in publog.get("published", []):
            m = tip_slug_re.match(str(e.get("slug", "")))
            if not m or m.group(1) >= today_str:
                continue
            s = m.group(2)
            if s not in prior_tip_use or m.group(1) > prior_tip_use[s]:
                prior_tip_use[s] = m.group(1)
        for t in tips:
            m = tip_slug_re.match(t["id"])
            prev = prior_tip_use.get(m.group(2)) if m else None
            if prev:
                fail(f"{t['id']}: tip už vyšel {prev} — tipy se neopakují; nový vývoj = nový slug a titulek")

    # --- followsUp (příběhové linky) ------------------------------------------
    for i in items:
        fu = i.get("followsUp")
        if fu is None:
            continue
        if not isinstance(fu, dict):
            fail(f"{i['id']}: followsUp musí být objekt")
            continue
        d = parse_iso(str(fu.get("date", "")))
        if d is None:
            fail(f"{i['id']}: followsUp.date neplatné ({fu.get('date')!r})")
        elif d >= today:
            fail(f"{i['id']}: followsUp.date {d} musí být starší než dnešek")
        elif (today - d).days >= FOLLOWSUP_WINDOW:
            warn(f"{i['id']}: followsUp.date {d} je mimo {FOLLOWSUP_WINDOW}denní archiv (odkaz nebude klikací)")
        if not fu.get("id"):
            fail(f"{i['id']}: followsUp.id chybí")
        for lang in ("cs", "en"):
            if not loc(fu, "title", lang).strip():
                fail(f"{i['id']}: followsUp.title.{lang} chybí")

    # --- radar (na obzoru) ------------------------------------------------------
    radar = brief.get("radar")
    radar_count = 0
    if radar is None:
        if v3:
            warn("brief nemá radar — když blok E rešerše žádný termín nenašel, napiš to do deníku")
    elif not isinstance(radar, list):
        fail("radar musí být pole")
    else:
        radar_count = len(radar)
        if radar_count > RADAR_MAX_HARD:
            fail(f"radar má {radar_count} položek (tvrdý strop {RADAR_MAX_HARD})")
        elif radar_count > RADAR_MAX_OK:
            warn(f"radar má {radar_count} položek (cíl ≤ {RADAR_MAX_OK})")
        seen: set[tuple[str, str]] = set()
        prev_date: date | None = None
        for n, r in enumerate(radar, 1):
            name = f"radar[{n}]"
            if not isinstance(r, dict):
                fail(f"{name}: musí být objekt")
                continue
            d = parse_iso(str(r.get("date", "")))
            if d is None:
                fail(f"{name}: date {r.get('date')!r} není platné ISO datum")
            else:
                ahead = (d - today).days
                if ahead < 0:
                    fail(f"{name}: datum {d} už uplynulo — stalo se → zpráva; posunulo se → nové datum; jinak ven")
                elif ahead > RADAR_DAYS_HARD:
                    fail(f"{name}: datum {d} je {ahead} dní dopředu (tvrdý strop {RADAR_DAYS_HARD})")
                elif ahead > RADAR_DAYS_OK:
                    warn(f"{name}: datum {d} je {ahead} dní dopředu (cíl ≤ {RADAR_DAYS_OK})")
                if prev_date and d < prev_date:
                    warn(f"{name}: radar není seřazený podle data")
                prev_date = d
            for lang in ("cs", "en"):
                title = loc(r, "title", lang)
                note = loc(r, "note", lang)
                check_text(f"{name}.title.{lang}", title, lang)
                check_text(f"{name}.note.{lang}", note, lang)
                if not title.strip():
                    fail(f"{name}: chybí title.{lang}")
                elif words(title) > 16:
                    fail(f"{name}.title.{lang}: {words(title)} slov (strop 12)")
                elif words(title) > 12:
                    warn(f"{name}.title.{lang}: {words(title)} slov (cíl ≤ 12)")
                if not note.strip():
                    fail(f"{name}: chybí note.{lang}")
                elif words(note) > 40:
                    fail(f"{name}.note.{lang}: {words(note)} slov (strop 30)")
                elif words(note) > 30:
                    warn(f"{name}.note.{lang}: {words(note)} slov (cíl ≤ 30)")
            key = (str(r.get("date")), loc(r, "title", "cs").strip().lower())
            if key in seen:
                fail(f"{name}: duplicitní termín {key}")
            seen.add(key)
            tiers, _domains = check_sources(name, r.get("sources", []), 1, 2)
            if tiers and min(tiers) == 3:
                warn(f"{name}: žádný T1/T2 zdroj — ověř, že jde o web pořadatele; jinak označ tentative")
            if "tentative" in r and not isinstance(r["tentative"], bool):
                fail(f"{name}: tentative musí být true/false")

    # --- radar: přenos ze včerejška (jen denní režim) ---------------------------
    if not file_mode and isinstance(radar, list):
        yesterday = load_brief_file(today - timedelta(days=1))
        for r in (yesterday or {}).get("radar") or []:
            d = parse_iso(str(r.get("date", ""))) if isinstance(r, dict) else None
            if d is None or d < today:
                continue
            old_title = loc(r, "title", "cs")
            kept = any(
                isinstance(t, dict) and str(t.get("date")) == d.isoformat()
                and (loc(t, "title", "cs").strip().lower() == old_title.strip().lower()
                     or jaccard(title_tokens(loc(t, "title", "cs")), title_tokens(old_title)) >= DUP_TITLE_SIMILARITY)
                for t in radar
            )
            if not kept:
                warn(f"radar: termín „{old_title}“ ({d}) ze včerejšího briefu chybí, ačkoli ještě neuplynul — "
                     f"přenes ho, nebo do deníku napiš proč ne")

    # --- podobné titulky proti posledním 14 dnům (jen denní režim) -----------------
    if not file_mode:
        prior: list[tuple[str, set[str]]] = []
        for k in range(1, INDEX_MAX_DAYS + 1):
            b = load_brief_file(today - timedelta(days=k))
            for pi in (b or {}).get("items", []):
                if isinstance(pi, dict) and pi.get("id"):
                    prior.append((pi["id"], title_tokens(loc(pi, "title", "cs"))))
        for i in news:
            mine = title_tokens(loc(i, "title", "cs"))
            for pid, toks in prior:
                if jaccard(mine, toks) >= DUP_TITLE_SIMILARITY:
                    warn(f"{i['id']}: titulek se podobá {pid} — stejná událost se neopakuje; nový vývoj = update s followsUp")
                    break

    # --- weekInReview (týden v AI, nedělní brief) ------------------------------------
    week = brief.get("weekInReview")
    is_sunday = today.weekday() == 6
    if week is None:
        if v3 and is_sunday:
            warn("nedělní brief nemá weekInReview (Týden v AI) — doplň 4–6 událostí týdne z archivu")
    elif not isinstance(week, list):
        fail("weekInReview musí být pole")
    else:
        if not is_sunday:
            warn("weekInReview je jen pro nedělní brief")
        if len(week) > WEEK_HARD:
            fail(f"weekInReview má {len(week)} položek (tvrdý strop {WEEK_HARD})")
        elif not WEEK_MIN <= len(week) <= WEEK_MAX:
            warn(f"weekInReview má {len(week)} položek (cíl {WEEK_MIN}–{WEEK_MAX})")
        seen_ids: set[str] = set()
        for n, e in enumerate(week, 1):
            name = f"weekInReview[{n}]"
            if not isinstance(e, dict):
                fail(f"{name}: musí být objekt")
                continue
            d = parse_iso(str(e.get("date", "")))
            if d is None:
                fail(f"{name}: date {e.get('date')!r} není platné ISO datum")
            elif not (today - timedelta(days=7) <= d < today):
                fail(f"{name}: date {d} není z posledních 7 dnů")
            eid = str(e.get("id", ""))
            if not eid:
                fail(f"{name}: chybí id")
            elif eid in seen_ids:
                fail(f"{name}: duplicitní id {eid}")
            elif "-tip-" in eid:
                warn(f"{name}: tip do ohlédnutí za týdnem nepatří ({eid})")
            seen_ids.add(eid)
            for lang in ("cs", "en"):
                title = loc(e, "title", lang)
                note = loc(e, "note", lang)
                check_text(f"{name}.title.{lang}", title, lang)
                check_text(f"{name}.note.{lang}", note, lang)
                if not title.strip():
                    fail(f"{name}: chybí title.{lang}")
                if not note.strip():
                    fail(f"{name}: chybí note.{lang}")
                elif words(note) > WEEK_NOTE_WORDS_HARD:
                    fail(f"{name}.note.{lang}: {words(note)} slov (strop {WEEK_NOTE_WORDS_OK})")
                elif words(note) > WEEK_NOTE_WORDS_OK:
                    warn(f"{name}.note.{lang}: {words(note)} slov (cíl ≤ {WEEK_NOTE_WORDS_OK})")
            if not file_mode and d is not None and eid:
                src = load_brief_file(d)
                if src is None:
                    warn(f"{name}: {d}.json není k dispozici — id {eid} nejde ověřit")
                else:
                    match = next((i for i in src.get("items", []) if isinstance(i, dict) and i.get("id") == eid), None)
                    if match is None:
                        fail(f"{name}: id {eid} v briefu {d} neexistuje")
                    else:
                        for lang in ("cs", "en"):
                            if loc(match, "title", lang).strip() != loc(e, "title", lang).strip():
                                warn(f"{name}.title.{lang}: neodpovídá doslova titulku {eid}")

    # --- kvíz dne --------------------------------------------------------------------------
    quiz = brief.get("quiz")
    quiz_count = 0
    item_ids = {i["id"] for i in items}
    if quiz is None:
        if v3:
            warn("brief nemá kvíz dne (quiz) — 3 otázky z faktů dnešních položek")
    elif not isinstance(quiz, list):
        fail("quiz musí být pole")
    else:
        quiz_count = len(quiz)
        if quiz_count > 4:
            fail(f"quiz má {quiz_count} otázek (má být {QUIZ_COUNT})")
        elif quiz_count != QUIZ_COUNT:
            warn(f"quiz má {quiz_count} otázek (má být {QUIZ_COUNT})")
        asked: set[str] = set()
        for n, q in enumerate(quiz, 1):
            name = f"quiz[{n}]"
            if not isinstance(q, dict):
                fail(f"{name}: musí být objekt")
                continue
            iid = str(q.get("itemId", ""))
            if iid not in item_ids:
                fail(f"{name}: itemId {iid!r} není mezi dnešními položkami")
            elif iid in asked:
                warn(f"{name}: druhá otázka na stejnou položku {iid}")
            asked.add(iid)
            for lang in ("cs", "en"):
                qtext = loc(q, "question", lang)
                check_text(f"{name}.question.{lang}", qtext, lang)
                if not qtext.strip():
                    fail(f"{name}: chybí question.{lang}")
                else:
                    if words(qtext) > 30:
                        fail(f"{name}.question.{lang}: {words(qtext)} slov (strop 20)")
                    elif words(qtext) > 20:
                        warn(f"{name}.question.{lang}: {words(qtext)} slov (cíl ≤ 20)")
                    if not qtext.strip().endswith("?"):
                        warn(f"{name}.question.{lang}: nekončí otazníkem")
                ex = loc(q, "explain", lang)
                check_text(f"{name}.explain.{lang}", ex, lang)
                if not ex.strip():
                    fail(f"{name}: chybí explain.{lang}")
                elif words(ex) > 35:
                    fail(f"{name}.explain.{lang}: {words(ex)} slov (strop 25)")
                elif words(ex) > 25:
                    warn(f"{name}.explain.{lang}: {words(ex)} slov (cíl ≤ 25)")
            opts = q.get("options")
            if not isinstance(opts, list) or len(opts) != 3:
                fail(f"{name}: options musí mít přesně 3 možnosti")
                opts = []
            for lang in ("cs", "en"):
                texts = [(o.get(lang, "") if isinstance(o, dict) else "") for o in opts]
                for k, t in enumerate(texts):
                    check_text(f"{name}.options[{k}].{lang}", t, lang)
                    if not str(t).strip():
                        fail(f"{name}: options[{k}].{lang} je prázdná")
                    elif words(t) > 12:
                        fail(f"{name}.options[{k}].{lang}: {words(t)} slov (strop 8)")
                    elif words(t) > 8:
                        warn(f"{name}.options[{k}].{lang}: {words(t)} slov (cíl ≤ 8)")
                if texts and len({str(t).strip().lower() for t in texts}) != len(texts):
                    fail(f"{name}: možnosti se opakují ({lang})")
            ans = q.get("answer")
            if not isinstance(ans, int) or isinstance(ans, bool) or not 0 <= ans < 3:
                fail(f"{name}: answer musí být index 0–2 (je {ans!r})")

    # --- slovníček (jen denní režim) ----------------------------------------------------
    if not file_mode:
        try:
            glossary = json.load(open(GLOSSARY, encoding="utf-8"))
        except FileNotFoundError:
            fail(f"chybí {GLOSSARY}")
            glossary = None
        except json.JSONDecodeError as e:
            fail(f"{GLOSSARY} není platný JSON: {e}")
            glossary = None
        if isinstance(glossary, dict):
            if parse_iso(str(glossary.get("updated", ""))) is None:
                warn("glossary.updated není platné ISO datum")
            terms = glossary.get("terms")
            if not isinstance(terms, list):
                fail("glossary.terms musí být pole")
                terms = []
            ids: dict[str, int] = {}
            alias_owner: dict[str, str] = {}
            for n, t in enumerate(terms, 1):
                name = f"glossary[{n}]"
                if not isinstance(t, dict) or not isinstance(t.get("id"), str) or not t["id"]:
                    fail(f"{name}: chybí id")
                    continue
                name = f"glossary[{t['id']}]"
                ids[t["id"]] = ids.get(t["id"], 0) + 1
                for lang in ("cs", "en"):
                    if not loc(t, "term", lang).strip():
                        fail(f"{name}: chybí term.{lang}")
                    short = loc(t, "short", lang)
                    if not short.strip():
                        fail(f"{name}: chybí short.{lang}")
                    elif words(short) > 45:
                        fail(f"{name}.short.{lang}: {words(short)} slov (strop 35)")
                    elif words(short) > 35:
                        warn(f"{name}.short.{lang}: {words(short)} slov (cíl ≤ 35)")
                    check_text(f"{name}.short.{lang}", short, lang)
                aliases = t.get("aliases")
                if not isinstance(aliases, list) or not aliases or not all(isinstance(a, str) and a.strip() for a in aliases):
                    fail(f"{name}: aliases musí být neprázdné pole textů")
                    continue
                for a in aliases:
                    key = a.strip().lower()
                    if key in alias_owner and alias_owner[key] != t["id"]:
                        warn(f"{name}: alias „{a}“ už patří pojmu {alias_owner[key]}")
                    alias_owner.setdefault(key, t["id"])
            for i_, c in ids.items():
                if c > 1:
                    fail(f"glossary: duplicitní id {i_}")
            infos.append(f"slovníček: {len(terms)} pojmů, aktualizován {glossary.get('updated')}")

    # --- published-log --------------------------------------------------------
    if publog is not None:
        logged = {e.get("slug") for e in publog.get("published", []) if isinstance(e, dict)}
        for i in items:
            if i["id"] not in logged:
                fail(f"{i['id']}: chybí v published-log.json (loguje se zpráva i tip)")
        oldest = None
        for e in publog.get("published", []):
            if not isinstance(e, dict) or not e.get("slug") or not e.get("date"):
                fail("published-log: záznam bez slug/date")
                continue
            d = parse_iso(str(e.get("date")))
            if d and (oldest is None or d < oldest):
                oldest = d
        if oldest and (today - oldest).days > PUBLOG_STALE_WARN_DAYS:
            warn(f"published-log má záznamy staré {(today - oldest).days} dní — prořež na {PUBLOG_KEEP_DAYS} dní")

    # --- index ------------------------------------------------------------------
    if index is not None:
        if not str(index.get("updated", "")).startswith(today_str):
            fail(f"index.updated ({index.get('updated')}) není z dneška")
        entries = index.get("briefs", [])
        if not entries or entries[0].get("date") != today_str:
            fail("index.briefs[0] musí být dnešek")
        if len(entries) > INDEX_MAX_DAYS:
            fail(f"index má {len(entries)} dnů (max {INDEX_MAX_DAYS})")
        dates = [str(e.get("date", "")) for e in entries]
        if dates != sorted(dates, reverse=True):
            warn("index.briefs není seřazený od nejnovějšího")
        for e in entries:
            if e.get("date") == today_str and e.get("itemCount") != len(items):
                fail(f"index.itemCount {e.get('itemCount')} ≠ {len(items)}")
            if not (BRIEFS / f"{e.get('date')}.json").exists():
                fail(f"index odkazuje na neexistující {e.get('date')}.json")
        for name in ("tips-backlog.json", "published-log.json"):
            if not (BRIEFS / name).exists():
                fail(f"chybí trvalý soubor {name} — NIKDY se nemaže")

    verified_n = sum(1 for i in items if i.get("verified") is True)
    week_n = len(week) if isinstance(week, list) else 0
    infos.append(
        f"{len(news)} zpráv · {len(tips)} tipů · {radar_count} na obzoru · týden v AI {week_n} · kvíz {quiz_count} · "
        f"ověřeno {verified_n}/{len(items)} · "
        f"zdroje T1 {tier_counts[1]} / T2 {tier_counts[2]} / ostatní {tier_counts[3]}"
    )
    return report()


def report() -> int:
    for i in infos:
        print(f"INFO  {i}")
    for w in warns:
        print(f"WARN  {w}")
    for f in fails:
        print(f"FAIL  {f}")
    print(f"\n{'❌ NEPUBLIKOVAT' if fails else '✅ OK'} — {len(fails)} chyb, {len(warns)} varování")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
