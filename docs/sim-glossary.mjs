#!/usr/bin/env node
// Simulace podtrhávání slovníčku (jen pro čtení): věrný port segmentText ze src/lib/glossary.ts.
// Použití: node docs/sim-glossary.mjs data/briefs/<datum>.json data/glossary.json > sim-out.txt
// Pro každou položku (cs i en) vypíše shrnutí a why s [[podtrženým slovem|id hesla]]; strop 3 pojmy
// na text, jen první výskyt, vyhrává nejdelší alias. Když se logika v glossary.ts změní, uprav i tento port.
import fs from 'node:fs';

const briefPath = process.argv[2];
const glossPath = process.argv[3];
const brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));
const glossary = JSON.parse(fs.readFileSync(glossPath, 'utf8'));

const CAP = 3;
const WORD = /[\p{L}\p{N}_]/u;
const isWordChar = (ch) => ch !== undefined && WORD.test(ch);
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function getMatcher(g) {
  const map = new Map();
  const aliases = [];
  for (const entry of g.terms) {
    for (const alias of entry.aliases) {
      const key = alias.toLowerCase();
      if (!map.has(key)) {
        map.set(key, entry);
        aliases.push(alias);
      }
    }
  }
  aliases.sort((a, b) => b.length - a.length);
  const re = new RegExp(aliases.map(escapeRegExp).join('|'), 'giu');
  return { re, map };
}
const matcher = getMatcher(glossary);

function segmentText(text) {
  const { re, map } = matcher;
  re.lastIndex = 0;
  const spans = [];
  const used = new Set();
  let m;
  while ((m = re.exec(text)) !== null && spans.length < CAP) {
    const match = m[0];
    if (match.length === 0) { re.lastIndex++; continue; }
    const start = m.index;
    const end = start + match.length;
    if (isWordChar(text[start - 1]) || isWordChar(text[end])) {
      re.lastIndex = start + 1;
      continue;
    }
    const entry = map.get(match.toLowerCase());
    if (!entry || used.has(entry.id)) continue;
    used.add(entry.id);
    spans.push({ start, end, entry });
  }
  if (spans.length === 0) return { marked: text, terms: [] };
  spans.sort((a, b) => a.start - b.start);
  let out = '';
  let pos = 0;
  for (const s of spans) {
    out += text.slice(pos, s.start) + '[[' + text.slice(s.start, s.end) + '|' + s.entry.id + ']]';
    pos = s.end;
  }
  out += text.slice(pos);
  return { marked: out, terms: spans.map((s) => s.entry.id) };
}

// Also report ALL raw glossary hits (before the cap / dedupe) to see what the cap drops.
function allHits(text) {
  const { re, map } = matcher;
  re.lastIndex = 0;
  const hits = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const match = m[0];
    if (match.length === 0) { re.lastIndex++; continue; }
    const start = m.index;
    const end = start + match.length;
    if (isWordChar(text[start - 1]) || isWordChar(text[end])) { re.lastIndex = start + 1; continue; }
    const entry = map.get(match.toLowerCase());
    if (entry) hits.push(`${match}->${entry.id}`);
  }
  return hits;
}

for (const lang of ['cs', 'en']) {
  console.log('\n==================== LANG', lang, '====================');
  for (const it of brief.items) {
    console.log(`\n--- ${it.id} (${it.kind}${it.highlight ? ', HIGHLIGHT' : ''})`);
    console.log('TITLE:', it.title[lang]);
    for (const f of ['summary', 'why']) {
      const t = it[f][lang];
      const r = segmentText(t);
      console.log(`${f.toUpperCase()} (${t.length} zn.): ${r.marked}`);
      console.log(`   -> underlined: ${r.terms.join(', ') || '(none)'}  | all raw hits: ${allHits(t).join(', ') || '(none)'}`);
    }
  }
}
