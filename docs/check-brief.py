#!/usr/bin/env python3
"""Kontrola před publikací denního AIspresso briefu.

Použití (z kořene repa):  python3 docs/check-brief.py [YYYY-MM-DD]
Bez argumentu se bere dnešní datum (UTC).

FAIL  = nepublikovat, oprav a spusť znovu.  WARN = posuď a rozhodni.
Exit kód 0 = vše OK (warny povolené), 1 = aspoň jeden FAIL.
"""
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

BRIEFS = Path("data/briefs")
CATEGORIES = {"models", "research", "business", "tools", "policy", "opensource"}

# Domény, které nikdy nesmí být citovaným zdrojem (agregátory, sociální sítě, blogy).
BANNED_SOURCE_DOMAINS = [
    "unrot.co", "buildfastwithai.com", "releasebot.io", "aitoolsrecap.com",
    "aiapps.com", "crescendo.ai", "medium.com", "substack.com",
    "news.ycombinator.com", "reddit.com", "x.com", "twitter.com",
    "facebook.com", "linkedin.com", "youtube.com", "techbuzz.ai",
    "the-agent-report.com", "tech-reader.blog", "techstartups.com",
    "dentro.de", "llm-stats.com", "marktechpost.com", "digitalapplied.com",
]
# Paywall: smí být citován jen v páru s volně čitelným zdrojem.
PAYWALLED_DOMAINS = ["bloomberg.com", "ft.com", "wsj.com", "theinformation.com"]

# Tip smí znovu vyjít nejdřív po tolika dnech od posledního zveřejnění (viz recept).
TIP_REPEAT_BLOCK_DAYS = 14

WEEKDAYS = [
    "pondělí", "pondělk", "úterý", "úterk", "středa", "středu", "středy",
    "středě", "čtvrtek", "čtvrtk", "pátek", "pátku", "pátky", "sobota",
    "sobotu", "soboty", "sobotě", "neděle", "neděli", "nedělí",
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
]

fails: list[str] = []
warns: list[str] = []


def fail(msg: str) -> None:
    fails.append(msg)


def warn(msg: str) -> None:
    warns.append(msg)


def texts_of(item: dict) -> list[tuple[str, str]]:
    out = []
    for field in ("title", "summary"):
        for lang in ("cs", "en"):
            out.append((f"{item.get('id', '?')}.{field}.{lang}", item.get(field, {}).get(lang, "")))
    return out


def domain_of(url: str) -> str:
    m = re.match(r"https?://([^/]+)", url)
    return (m.group(1) if m else "").lower().removeprefix("www.")


def main() -> int:
    today = sys.argv[1] if len(sys.argv) > 1 else datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # --- načtení souborů -------------------------------------------------
    try:
        brief = json.load(open(BRIEFS / f"{today}.json"))
    except FileNotFoundError:
        fail(f"chybí {BRIEFS}/{today}.json")
        return report()
    except json.JSONDecodeError as e:
        fail(f"{today}.json není platný JSON: {e}")
        return report()
    try:
        index = json.load(open(BRIEFS / "index.json"))
    except Exception as e:
        fail(f"index.json nejde načíst: {e}")
        return report()
    try:
        backlog = json.load(open(BRIEFS / "tips-backlog.json"))
    except Exception as e:
        fail(f"tips-backlog.json nejde načíst: {e}")
        backlog = {"tips": []}
    try:
        publog = json.load(open(BRIEFS / "published-log.json"))
    except Exception as e:
        fail(f"published-log.json nejde načíst: {e}")
        publog = {"published": []}

    items = brief.get("items", [])
    tips = [i for i in items if "-tip-" in i.get("id", "")]
    news = [i for i in items if "-tip-" not in i.get("id", "")]

    # --- základní tvar ----------------------------------------------------
    if brief.get("date") != today:
        fail(f"brief.date = {brief.get('date')}, čekáno {today}")
    if brief.get("sample") is not False:
        fail("sample musí být false")
    for field in ("headline", "intro"):
        for lang in ("cs", "en"):
            if not brief.get(field, {}).get(lang, "").strip():
                fail(f"{field}.{lang} je prázdný")
    hl_words = len(brief.get("headline", {}).get("cs", "").split())
    if hl_words > 12:
        fail(f"headline.cs má {hl_words} slov (tvrdý strop 12)")
    elif hl_words > 8:
        warn(f"headline.cs má {hl_words} slov (cíl ≤ 8)")

    if not items:
        fail("brief nemá žádné položky")
    if len(items) > 12:
        fail(f"{len(items)} položek (tvrdý strop 12)")

    highlights = [i["id"] for i in items if i.get("highlight")]
    if len(highlights) != 1:
        fail(f"highlight musí být právě 1, je {len(highlights)}: {highlights}")
    if any("-tip-" in h for h in highlights):
        fail(f"highlight nesmí být tip: {highlights}")

    ids = [i.get("id", "") for i in items]
    if len(set(ids)) != len(ids):
        fail("duplicitní id položek")
    for i in items:
        if not i.get("id", "").startswith(today):
            fail(f"id {i.get('id')} nezačíná dnešním datem")
        if i.get("category") not in CATEGORIES:
            fail(f"{i.get('id')}: neplatná kategorie {i.get('category')!r}")

    # --- texty -------------------------------------------------------------
    for name, text in [(f"headline.{l}", brief["headline"][l]) for l in ("cs", "en")] + \
                      [(f"intro.{l}", brief["intro"][l]) for l in ("cs", "en")] + \
                      [t for i in items for t in texts_of(i)]:
        low = text.lower()
        for d in WEEKDAYS:
            if d in low:
                fail(f"{name}: obsahuje název dne v týdnu („{d}“) — použij datum nebo relativní výraz")
                break
        if '"' in text:
            fail(f"{name}: obsahuje ASCII uvozovku — použij typografické „“ (CZ) / ‘’ (EN)")

    for i in items:
        is_tip = "-tip-" in i["id"]
        lo, hi = (25, 55) if is_tip else (30, 60)
        target = "~35" if is_tip else "40–50"
        for lang in ("cs", "en"):
            n = len(i.get("summary", {}).get(lang, "").split())
            if not lo <= n <= hi:
                fail(f"{i['id']}.summary.{lang}: {n} slov (tvrdé meze {lo}–{hi})")
            elif not is_tip and not 40 <= n <= 50:
                warn(f"{i['id']}.summary.{lang}: {n} slov (cíl {target})")
        for lang in ("cs", "en"):
            if not i.get("title", {}).get(lang, "").strip():
                fail(f"{i['id']}: chybí title.{lang}")
            if i["title"][lang].lower().startswith("tip"):
                fail(f"{i['id']}: titulek nesmí začínat slovem „tip“")

    # --- zdroje -------------------------------------------------------------
    for i in items:
        srcs = i.get("sources", [])
        if not 1 <= len(srcs) <= 3:
            fail(f"{i['id']}: {len(srcs)} zdrojů (povoleno 1–3)")
        domains = []
        for s in srcs:
            url = s.get("url", "")
            if not url.startswith("http"):
                fail(f"{i['id']}: neplatné URL {url!r}")
                continue
            d = domain_of(url)
            domains.append(d)
            for banned in BANNED_SOURCE_DOMAINS:
                if d == banned or d.endswith("." + banned):
                    fail(f"{i['id']}: zakázaná doména ve zdrojích ({d})")
        pay = [d for d in domains if any(d == p or d.endswith("." + p) for p in PAYWALLED_DOMAINS)]
        free = [d for d in domains if d not in pay]
        if pay and not free:
            fail(f"{i['id']}: jen paywallové zdroje ({pay}) — přidej volně čitelný")
        if i.get("verified") is True and len(srcs) < 2:
            fail(f"{i['id']}: verified:true vyžaduje ≥2 zdroje")
        if i.get("verified") not in (True, False):
            fail(f"{i['id']}: verified musí být true/false")

    # --- tipy ----------------------------------------------------------------
    expected_tips = min(4, max(0, 8 - len(news)))
    if len(news) >= 8 and tips:
        fail(f"{len(news)} čerstvých zpráv → tipy do briefu nepatří (je jich {len(tips)})")
    if len(tips) > 4:
        fail(f"{len(tips)} tipů (strop 4)")
    elif tips and len(tips) != expected_tips:
        warn(f"{len(tips)} tipů při {len(news)} zprávách (vzorec říká {expected_tips})")
    bl = {t["slug"]: t for t in backlog.get("tips", [])}
    for t in tips:
        slug = t["id"].removeprefix(f"{today}-")
        if t.get("category") != "tools":
            fail(f"{t['id']}: tip musí mít category tools")
        if slug not in bl:
            fail(f"{t['id']}: tip chybí v tips-backlog.json")
        elif bl[slug].get("used") != today:
            fail(f"{t['id']}: v backlogu nemá used={today}")
    tip_themes = [bl[t["id"].removeprefix(f"{today}-")].get("theme") for t in tips
                  if t["id"].removeprefix(f"{today}-") in bl]
    if len(tip_themes) != len(set(tip_themes)):
        warn(f"opakované téma tipů v jednom briefu: {tip_themes}")

    # --- tipy: žádné brzké opakování (published-log nese i tipy) --------------
    tip_slug_re = re.compile(r"^(\d{4}-\d{2}-\d{2})-(tip-.+)$")
    prior_tip_use: dict[str, str] = {}  # holý tip-slug -> nejnovější dřívější datum
    for e in publog.get("published", []):
        m = tip_slug_re.match(e.get("slug", ""))
        if not m or m.group(1) >= today:
            continue
        s = m.group(2)
        if s not in prior_tip_use or m.group(1) > prior_tip_use[s]:
            prior_tip_use[s] = m.group(1)
    for t in tips:
        m = tip_slug_re.match(t["id"])
        prev = prior_tip_use.get(m.group(2)) if m else None
        if not prev:
            continue
        delta = (datetime.strptime(today, "%Y-%m-%d") - datetime.strptime(prev, "%Y-%m-%d")).days
        if delta < TIP_REPEAT_BLOCK_DAYS:
            fail(f"{t['id']}: tip už vyšel {prev} (před {delta} dny) — opakovat lze "
                 f"nejdřív po {TIP_REPEAT_BLOCK_DAYS} dnech; nahraď ho, nebo dej méně položek")
        else:
            warn(f"{t['id']}: opakování tipu z {prev} (před {delta} dny) — posuď, "
                 f"zda je vědomé a funkce je pořád aktuální")

    # --- followsUp (příběhové linky) ------------------------------------------
    date_re = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    for i in items:
        fu = i.get("followsUp")
        if fu is None:
            continue
        if not isinstance(fu, dict):
            fail(f"{i['id']}: followsUp musí být objekt")
            continue
        d = str(fu.get("date", ""))
        if not date_re.match(d):
            fail(f"{i['id']}: followsUp.date neplatné ({d!r})")
        elif d >= today:
            fail(f"{i['id']}: followsUp.date {d} musí být starší než dnešek")
        else:
            delta = (datetime.strptime(today, "%Y-%m-%d") - datetime.strptime(d, "%Y-%m-%d")).days
            if delta >= 7:
                warn(f"{i['id']}: followsUp.date {d} je mimo 7denní archiv (odkaz nebude klikací)")
        if not fu.get("id"):
            fail(f"{i['id']}: followsUp.id chybí")
        for lang in ("cs", "en"):
            if not fu.get("title", {}).get(lang, "").strip():
                fail(f"{i['id']}: followsUp.title.{lang} chybí")

    # --- published-log --------------------------------------------------------
    logged = {e.get("slug") for e in publog.get("published", [])}
    for i in items:
        if i["id"] not in logged:
            fail(f"{i['id']}: chybí v published-log.json (loguje se zpráva i tip)")
    for e in publog.get("published", []):
        if not e.get("slug") or not e.get("date"):
            fail("published-log: záznam bez slug/date")

    # --- index ------------------------------------------------------------------
    if not str(index.get("updated", "")).startswith(today):
        fail(f"index.updated ({index.get('updated')}) není z dneška")
    entries = index.get("briefs", [])
    if not entries or entries[0].get("date") != today:
        fail("index.briefs[0] musí být dnešek")
    if len(entries) > 7:
        fail(f"index má {len(entries)} dnů (max 7)")
    for e in entries:
        if e.get("date") == today and e.get("itemCount") != len(items):
            fail(f"index.itemCount {e.get('itemCount')} ≠ {len(items)}")
        if not (BRIEFS / f"{e['date']}.json").exists():
            fail(f"index odkazuje na neexistující {e['date']}.json")
    index_dates = {e["date"] for e in entries}
    for f in BRIEFS.glob("????-??-??.json"):
        if f.stem not in index_dates:
            fail(f"soubor {f.name} není v indexu — smaž ho, nebo doplň index")
    for name in ("tips-backlog.json", "published-log.json"):
        if not (BRIEFS / name).exists():
            fail(f"chybí trvalý soubor {name} — NIKDY se nemaže")

    return report()


def report() -> int:
    for w in warns:
        print(f"WARN  {w}")
    for f in fails:
        print(f"FAIL  {f}")
    print(f"\n{'❌ NEPUBLIKOVAT' if fails else '✅ OK'} — {len(fails)} chyb, {len(warns)} varování")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
