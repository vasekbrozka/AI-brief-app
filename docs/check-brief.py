#!/usr/bin/env python3
"""Kontrola před publikací denního AIspresso briefu (schéma v3).

Použití (z kořene repa):
  python3 docs/check-brief.py [YYYY-MM-DD]       # dnešní (UTC) nebo zadaný den — vše včetně ledgerů
  python3 docs/check-brief.py --file CESTA.json  # jen schéma a texty souboru (bez indexu a ledgerů)

FAIL = nepublikovat, oprav a spusť znovu.  WARN = posuď a rozhodni (důvod do deníku).
Exit kód 0 = vše OK (warny povolené), 1 = aspoň jeden FAIL.
"""
import json
import re
import sys
from datetime import date, datetime, timezone
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

# Intro nesmí počítat položky („Přinášíme tři zprávy a jeden tip").
INTRO_COUNT_PATTERNS = [
    r"přináším\w*\s+(\w+\s+){0,2}(zpráv\w*|novin\w*|tip\w*|položk\w*)",
    r"doplňujeme\s+(\w+\s+){0,2}tip\w*",
    r"\bmáme\s+(\w+\s+){0,2}(zpráv\w*|novin\w*|tip\w*)",
    r"\b(jedn\w+|dv[aě]|tři|čtyři|pět|šest|sedm|osm|devět|deset|\d+)\s+(zpráv\w*|novin\w*|tip\w*)\b",
    r"\bwe bring\b", r"\bwe('re| are) bringing\b",
    r"\bwe (add|include|have|offer)\s+(\w+\s+){0,2}(news|stories|tips|items)\b",
    r"\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(news items|stories|tips)\b",
]
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
    for field in ("headline", "intro"):
        for lang in ("cs", "en"):
            if not loc(brief, field, lang).strip():
                fail(f"{field}.{lang} je prázdný")
    for lang in ("cs", "en"):
        hl_words = words(loc(brief, "headline", lang))
        if hl_words > 12:
            fail(f"headline.{lang} má {hl_words} slov (tvrdý strop 12)")
        elif hl_words > 9:
            warn(f"headline.{lang} má {hl_words} slov (cíl ≤ 9)")
        intro = loc(brief, "intro", lang)
        intro_words = words(intro)
        if intro_words > 30:
            fail(f"intro.{lang} má {intro_words} slov (tvrdý strop 30, cíl ≤ 25)")
        elif intro_words > 25:
            warn(f"intro.{lang} má {intro_words} slov (cíl ≤ 25)")
        low = intro.lower()
        for pat in INTRO_COUNT_PATTERNS:
            if v3 and re.search(pat, low):
                fail(f"intro.{lang}: počítá položky („{intro}“) — intro říká, čím den žije, ne kolik toho je")
                break

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
        check_text(f"intro.{lang}", loc(brief, "intro", lang), lang)

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
    infos.append(
        f"{len(news)} zpráv · {len(tips)} tipů · {radar_count} na obzoru · ověřeno {verified_n}/{len(items)} · "
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
