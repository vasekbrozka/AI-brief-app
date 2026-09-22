// Post-build guard: the built stylesheet must still contain the selectors
// every screen depends on. A CSS edit that drops a block by accident (it
// happened once: an index-based replace ate 770 lines) then fails the build
// instead of reaching Netlify.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REQUIRED = [
  '.navbar', '.large-title__heading', '.tabbar__item', '.segmented__option',
  '.swipe', '.item__meta', '.item__title', '.item__summary', '.item__why',
  '.item__bar', '.iconbtn', '.read-cta', '.item--folded .item__title',
  '.vote-btn', '.rate', '.rateprompt', '.readbars__seg', '.headmeta',
  '.streakcard', '.sc__num', '.sc__dot', '.streak-divider',
  '.section-divider', '.radar__row', '.share-brief', '.panel', '.termday__term',
  '.todo__row', '.todo__check', '.list__row', '.archive-row__headline',
  '.settings-group__body', '.setting-switch', '.switch__thumb',
  '.toaster', '.toast', '.gpop', '.state__title', '.skeleton-line',
  '.brief__side', '.tabbar__brand', '.railrow', '.side__scroll', '.side__foot', '.footbar', '.headmeta',
  '.brief__plan', '.cal__cell', '.cal__dayname', '.plan__range', '.plan__filters', '.cat-toggle',
  '.shots', '.shotcard', '.shotcard__title',
];

const dir = join(process.cwd(), 'dist', 'assets');
const css = readdirSync(dir)
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(join(dir, f), 'utf8'))
  .join('\n');
if (!css) {
  console.error('check-css: no stylesheet found in dist/assets');
  process.exit(1);
}
// The selector must open its own rule (minified: "sel{" or "sel,"), not merely
// appear inside a compound selector such as ".iconbtn.is-saved".
const missing = REQUIRED.filter((sel) => !css.includes(sel + '{') && !css.includes(sel + ','));
if (missing.length) {
  console.error(`check-css: ${missing.length} required selector(s) missing from the built CSS:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}
console.log(`check-css: ${REQUIRED.length} required selectors present`);
