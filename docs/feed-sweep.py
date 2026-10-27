#!/usr/bin/env python3
"""Blok 0 rešerše: co zdroje vydaly za posledních N dní a v appce ještě nebylo."""
import argparse
import html
import importlib.util
import json
import re
import signal
import subprocess
import time
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parent.parent
BRIEFS = ROOT / "data" / "briefs"

_spec = importlib.util.spec_from_file_location("check_brief", ROOT / "docs" / "check-brief.py")
cb = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(cb)

UA = "Mozilla/5.0 (compatible; AIspresso-sweep/1.0)"

# (klíč, název, typ, url, filtr "ai" = jen titulky o AI, prefix článků u html)
SOURCES = [
    ("openai", "OpenAI", "rss", "https://openai.com/news/rss.xml", None, None),
    ("anthropic", "Anthropic", "html", "https://www.anthropic.com/news", None, "/news/"),
    ("claude-blog", "Anthropic", "html", "https://claude.com/blog", None, "/blog/"),
    ("claude-articles", "Anthropic", "html", "https://claude.com/resources/articles", None, "/resources/articles/"),
    ("google-ai", "Google", "rss", "https://blog.google/technology/ai/rss/", None, None),
    ("gemini", "Google", "rss", "https://blog.google/products/gemini/rss/", None, None),
    ("google", "Google", "rss", "https://blog.google/rss/", "ai", None),
    ("deepmind", "DeepMind", "rss", "https://deepmind.google/blog/rss.xml", None, None),
    ("workspace", "Google", "rss", "https://workspaceupdates.googleblog.com/feeds/posts/default", "ai", None),
    ("microsoft", "Microsoft", "rss", "https://blogs.microsoft.com/feed/", "ai", None),
    ("windows", "Microsoft", "rss", "https://blogs.windows.com/feed/", "ai", None),
    ("m365", "Microsoft", "rss", "https://www.microsoft.com/en-us/microsoft-365/blog/feed/", "ai", None),
    ("github", "GitHub", "rss", "https://github.blog/changelog/feed/", "ai", None),
    ("nvidia", "NVIDIA", "rss", "https://blogs.nvidia.com/feed/", "ai", None),
    ("huggingface", "Hugging Face", "rss", "https://huggingface.co/blog/feed.xml", None, None),
    ("mistral", "Mistral", "html", "https://mistral.ai/news", None, "/news/"),
    ("cursor", "Cursor", "html", "https://cursor.com/changelog", None, "/changelog/"),
    ("perplexity", "Perplexity", "html", "https://www.perplexity.ai/changelog", None, "/changelog/"),
    ("apple", "Apple", "rss", "https://www.apple.com/newsroom/rss-feed.rss", "ai", None),
    ("samsung", "Samsung", "rss", "https://news.samsung.com/global/feed", "ai", None),
    ("techcrunch", "TechCrunch", "rss", "https://techcrunch.com/category/artificial-intelligence/feed/", None, None),
    ("verge", "The Verge", "rss", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", None, None),
    ("ars", "Ars Technica", "rss", "https://arstechnica.com/ai/feed/", None, None),
    ("wired", "Wired", "rss", "https://www.wired.com/feed/tag/ai/latest/rss", None, None),
    ("techreview", "MIT Technology Review", "rss", "https://www.technologyreview.com/topic/artificial-intelligence/feed", None, None),
    ("venturebeat", "VentureBeat", "rss", "https://venturebeat.com/category/ai/feed/", None, None),
    ("register", "The Register", "rss", "https://www.theregister.com/headlines.atom", "ai", None),
    ("tnw", "The Next Web", "rss", "https://thenextweb.com/feed", "ai", None),
    ("engadget", "Engadget", "rss", "https://www.engadget.com/rss.xml", "ai", None),
    ("9to5google", "9to5Google", "rss", "https://9to5google.com/feed/", "ai", None),
    ("9to5mac", "9to5Mac", "rss", "https://9to5mac.com/feed/", "ai", None),
    ("lupa", "Lupa", "rss", "https://www.lupa.cz/rss/clanky/", "ai", None),
    ("irozhlas", "iROZHLAS", "rss", "https://www.irozhlas.cz/rss/irozhlas", "ai", None),
    ("zive", "Živě.cz", "rss", "https://www.zive.cz/rss/sc-47/", "ai", None),
    ("czechcrunch", "CzechCrunch", "rss", "https://cc.cz/feed/", "ai", None),
    ("techmeme", "Techmeme", "rss", "https://www.techmeme.com/feed.xml", "ai", None),
    ("hn", "Hacker News", "rss", "https://hnrss.org/frontpage", "ai", None),
    ("simonw", "Simon Willison", "rss", "https://simonwillison.net/atom/everything/", "ai", None),
]

AI_WORDS = re.compile(
    r"\b(ai|a\.i\.|artificial intelligence|uměl\w+ inteligenc\w+|llms?|gpt[\w.-]*|chatgpt|openai|"
    r"claude|anthropic|gemini|gemma|copilot|cursor|perplexity|notebooklm|grok|xai|llama|mistral|"
    r"deepseek|qwen|kimi|nemotron|codex|sora|veo|imagen|muse|models?|agents?|agentic|chatbots?|"
    r"machine learning|neural|generative|genai|siri|apple intelligence|galaxy ai|rtx|gpus?|"
    r"inference|data ?centers?|modely|modelů|agent\w*)\b",
    re.IGNORECASE,
)

ATOM = "{http://www.w3.org/2005/Atom}"
DC = "{http://purl.org/dc/elements/1.1/}"
MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
_MON = "|".join(MONTHS)
HTML_DATE = re.compile(
    rf"\b(?P<mon>{_MON})[a-z]*\.?\s+(?P<day>\d{{1,2}}),?\s+(?P<year>20\d\d)\b"
    rf"|\b(?P<iso>20\d\d-\d\d-\d\d)\b"
    rf"|\b(?P<day2>\d{{1,2}})\.?\s+(?P<mon2>{_MON})[a-z]*\.?\s+(?P<year2>20\d\d)\b",
    re.IGNORECASE,
)
ANCHOR = re.compile(r"<a\b[^>]*?\bhref=([\"'])(.*?)\1[^>]*>(.*?)</a>", re.IGNORECASE | re.DOTALL)
SKIP_PATH = re.compile(r"/(category|categories|tag|tags|page|author|authors)/", re.IGNORECASE)
STOP = set(
    "the and for with from that this your their into about more than what when will have been over "
    "just after before them they which also make made makes using used now today here there new news "
    "launch launches launched introducing introduces announces announced update updates available "
    "release releases released rolling rollout out google openai anthropic microsoft nvidia github meta "
    "apple amazon claude gemini chatgpt copilot models model agents agent help helps build building "
    "faster better first year years says said week october september 2026 how why can you are its "
    "samsung galaxy intel amd ibm windows android iphone pixel chrome".split()
)


def clean(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text or "")
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def fetch(url: str) -> tuple[bytes | None, str]:
    err = "curl selhal"
    for attempt in range(2):
        if attempt:
            time.sleep(2)
        try:
            r = subprocess.run(
                ["curl", "-sS", "-L", "-f", "--max-time", "20", "-A", UA, url],
                capture_output=True, timeout=35,
            )
        except subprocess.TimeoutExpired:
            err = "timeout"
            continue
        if r.returncode == 0:
            return r.stdout, ""
        err = (r.stderr.decode("utf-8", "replace").strip().splitlines() or [err])[-1]
        if r.returncode == 22:  # HTTP chyba (403, 404, 429) — opakování nepomůže
            break
    return None, err


def feed_date(s: str | None) -> date | None:
    if not s:
        return None
    s = s.strip()
    try:
        d = parsedate_to_datetime(s)
    except (TypeError, ValueError):
        try:
            d = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except ValueError:
            return None
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    return d.astimezone(timezone.utc).date()


def html_date(text: str) -> date | None:
    m = HTML_DATE.search(text)
    if not m:
        return None
    try:
        if m.group("iso"):
            return date.fromisoformat(m.group("iso"))
        if m.group("mon"):
            return date(int(m.group("year")), MONTHS.index(m.group("mon").lower()[:3]) + 1, int(m.group("day")))
        return date(int(m.group("year2")), MONTHS.index(m.group("mon2").lower()[:3]) + 1, int(m.group("day2")))
    except ValueError:
        return None


def parse_rss(data: bytes) -> list[tuple[str, str, date | None]]:
    root = ET.fromstring(data)
    out = []
    for it in root.iter("item"):
        when = feed_date(it.findtext("pubDate") or it.findtext(DC + "date"))
        out.append((clean(it.findtext("title") or ""), (it.findtext("link") or "").strip(), when))
    for it in root.iter(ATOM + "entry"):
        link = ""
        for el in it.findall(ATOM + "link"):
            if el.get("rel", "alternate") == "alternate":
                link = el.get("href", "")
                break
        when = feed_date(it.findtext(ATOM + "published") or it.findtext(ATOM + "updated"))
        out.append((clean(it.findtext(ATOM + "title") or ""), link.strip(), when))
    return out


def parse_html(data: bytes, base: str, prefix: str) -> list[tuple[str, str, date | None]]:
    page = data.decode("utf-8", "replace")
    found: dict[str, tuple[str, date | None]] = {}
    for m in ANCHOR.finditer(page):
        url = urljoin(base, html.unescape(m.group(2)))
        path = urlparse(url).path
        if not path.startswith(prefix) or path.rstrip("/") == prefix.rstrip("/") or SKIP_PATH.search(path):
            continue
        inner = m.group(3)
        when = html_date(clean(inner)) or html_date(clean(page[m.end():m.end() + 500])) \
            or html_date(clean(page[max(0, m.start() - 400):m.start()]))
        title = clean(inner)[:160]
        prev = found.get(url)
        if prev:
            title = title if len(title) > len(prev[0]) else prev[0]
            when = prev[1] or when
        found[url] = (title, when)
    return [(t, u, d) for u, (t, d) in found.items() if t]


def norm(url: str) -> str:
    p = urlparse(url.strip())
    host = p.netloc.lower().removeprefix("www.")
    return (host + re.sub(r"/+$", "", p.path)).lower()


def tokens(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9]+(?:[.\-][a-z0-9]+)*", (text or "").lower())
    return {w for w in words if (len(w) >= 3 or any(c.isdigit() for c in w)) and w not in STOP}


def names(text: str) -> set[str]:
    out = set()
    for sentence in re.split(r"(?<=[.!?])\s+", text or ""):
        words = re.findall(r"[A-Za-z0-9]+(?:[.\-][A-Za-z0-9]+)*", sentence)
        out |= {w.lower() for w in words[1:] if w[0].isupper()}
    return out


def known_urls_and_items(today: date) -> tuple[dict[str, str], list[tuple[str, set[str], set[str]]]]:
    known: dict[str, str] = {}
    recent: list[tuple[str, set[str], set[str]]] = []
    for path in sorted(BRIEFS.glob("20*.json")):
        try:
            brief = json.load(open(path, encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        if not isinstance(brief, dict) or brief.get("sample"):
            continue
        for it in brief.get("items", []):
            for s in it.get("sources", []):
                known.setdefault(norm(s.get("url", "")), f"vyšlo {it.get('id')}")
            bdate = cb.parse_iso(str(brief.get("date", "")))
            if bdate and (today - bdate).days <= 60:
                text = f"{cb.loc(it, 'title', 'en')}. {cb.loc(it, 'summary', 'en')}"
                recent.append((str(it.get("id")), tokens(text), names(text)))
        for r in brief.get("radar", []) or []:
            for s in r.get("sources", []):
                known.setdefault(norm(s.get("url", "")), f"radar {r.get('date')}")
    try:
        bank = json.load(open(BRIEFS / "tips-backlog.json", encoding="utf-8")).get("tips", [])
    except (json.JSONDecodeError, OSError):
        bank = []
    for t in bank:
        state = f"tip vyšel {t.get('used')}" if t.get("used") else "tip čeká v bance"
        for s in t.get("sources", []):
            known.setdefault(norm(s.get("url", "")), f"{state}: {t.get('slug')}")
    return known, recent


def maybe_dup(title: str, recent: list[tuple[str, set[str], set[str]]], df: dict[str, int]) -> str:
    own = tokens(title)
    best, best_score, best_hits = "", 0.0, set()
    for item_id, toks, item_names in recent:
        hits = own & toks
        if len(hits) < 2:
            continue
        # silný signál: vzácné vlastní jméno („Argon") nebo verze s písmeny i číslicemi („gpt-6.1")
        strong = {h for h in hits if (h in item_names and df.get(h, 0) <= 3)
                  or (re.search(r"[a-z]", h) and re.search(r"\d", h))}
        if not strong and not (len(hits) >= 3 and len(hits) / len(own) >= 0.5):
            continue
        score = sum((1.0 if h in strong else 0.2) / max(df.get(h, 1), 1) for h in hits)
        if score > best_score:
            best, best_score, best_hits = item_id, score, hits
    return f"{best} [{', '.join(sorted(best_hits))}]" if best else ""


def sweep_source(src: tuple) -> tuple[str, list, str]:
    key, name, kind, url, flt, prefix = src
    data, err = fetch(url)
    if data is None:
        return key, [], err
    try:
        entries = parse_html(data, url, prefix) if kind == "html" else parse_rss(data)
    except ET.ParseError as e:
        return key, [], f"nečitelný feed ({e})"
    if flt == "ai":
        entries = [e for e in entries if AI_WORDS.search(e[0])]
    return key, [(name, *e) for e in entries], ""


def main() -> int:
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)
    ap = argparse.ArgumentParser(description="Sweep zdrojů pro denní brief (blok 0 receptu).")
    ap.add_argument("--days", type=int, default=14, help="okno ve dnech (výchozí 14)")
    ap.add_argument("--today", help="den briefu YYYY-MM-DD (výchozí dnešek UTC)")
    ap.add_argument("--all", action="store_true", help="vypiš i položky, které už v appce jsou")
    ap.add_argument("--json", help="ulož kandidáty i jako JSON do tohoto souboru")
    args = ap.parse_args()

    today = date.fromisoformat(args.today) if args.today else datetime.now(timezone.utc).date()
    since = today - timedelta(days=args.days)
    known, recent = known_urls_and_items(today)
    df: dict[str, int] = {}
    for _, toks, _ in recent:
        for t in toks:
            df[t] = df.get(t, 0) + 1

    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(sweep_source, SOURCES))

    failed = [f"{k} ({err})" for k, _, err in results if err]
    merged: dict[str, dict] = {}
    for key, entries, _ in results:
        for name, title, url, when in entries:
            if not url or not title:
                continue
            n = norm(url)
            row = merged.get(n)
            if row:
                if name not in row["source"]:
                    row["source"] += f", {name}"
                row["date"] = row["date"] or when
                continue
            merged[n] = {"date": when, "source": name, "title": title, "url": url,
                         "tier": cb.tier_of(cb.domain_of(url)), "key": key}

    fresh, dups, undated, already = [], [], [], []
    for n, row in merged.items():
        when = row["date"]
        if when and (when < since or when > today + timedelta(days=1)):
            continue
        row["status"] = known.get(n, "")
        if row["status"]:
            already.append(row)
            continue
        if when is None:
            undated.append(row)
            continue
        row["match"] = maybe_dup(row["title"], recent, df)
        (dups if row["match"] else fresh).append(row)

    def line(row: dict, extra: str = "") -> str:
        when = row["date"].isoformat() if row["date"] else "????-??-??"
        return f"{when}  T{row['tier']}  {row['source'][:22]:<22}  {row['title'][:120]}\n{'':16}{row['url']}{extra}"

    by_date = lambda r: (r["date"] or date.min, -r["tier"])
    print(f"Sweep {today} · okno {args.days} dní (od {since}) · zdroje {len(SOURCES) - len(failed)}/{len(SOURCES)} OK")
    if failed:
        print("Selhalo: " + " · ".join(failed))
    print(f"\nNOVÉ ({len(fresh)}) — kandidáti k triáži, datum události ověř u zdroje:")
    for row in sorted(fresh, key=by_date, reverse=True):
        print(line(row))
    print(f"\nMOŽNÁ DUPLICITA ({len(dups)}) — porovnej s uvedenou položkou:")
    for row in sorted(dups, key=by_date, reverse=True):
        print(line(row, f"\n{'':16}~ {row['match']}"))
    undated = sorted(undated, key=lambda r: r["key"])
    print(f"\nBEZ DATA ({len(undated)}) — HTML stránky, kde skript datum nenašel; ověř ručně:")
    for row in undated[:40]:
        print(line(row))
    print(f"\nUž v appce nebo v bance: {len(already)}" + ("" if args.all else " (vypiš je s --all)"))
    if args.all:
        for row in sorted(already, key=by_date, reverse=True):
            print(line(row, f"\n{'':16}= {row['status']}"))

    if args.json:
        rows = [dict(r, date=r["date"].isoformat() if r["date"] else None)
                for r in fresh + dups + undated + already]
        Path(args.json).write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
