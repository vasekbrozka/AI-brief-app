import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

// Runs daily at 05:15 UTC, after the 03:00 UTC generation has landed. Checks
// GitHub for today's brief and sends one push per subscriber, carrying the
// day's headline and story count in the subscriber's language. The VAPID
// private key lives in Netlify environment variables, never in the repo.
const RAW_INDEX =
  'https://raw.githubusercontent.com/vasekbrozka/AI-brief-app/refs/heads/claude/daily-ai-brief-app-b1qq0p/data/briefs/index.json';
const VAPID_PUBLIC_KEY =
  'BDM3FG_HdmoXa_wlZPrbcvGW99d5OodcIdAjsZ3LtPBtuOtFpVQN41m2LltNbZfjCFuCGuA51mffSdusGTnRkA0';
const VAPID_SUBJECT = 'https://aispresso.app';

export default async () => {
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!privateKey) {
    console.error('VAPID_PRIVATE_KEY is not set — add it in Netlify env vars and redeploy.');
    return new Response('missing key', { status: 500 });
  }

  const res = await fetch(RAW_INDEX, { cache: 'no-store' });
  if (!res.ok) {
    console.error('index fetch failed:', res.status);
    return new Response('index fetch failed', { status: 502 });
  }
  const index = await res.json();
  const latest = index.briefs?.[0];
  const today = new Date().toISOString().slice(0, 10);
  if (!latest || latest.date !== today) {
    console.log('no fresh brief for', today, '— latest is', latest?.date);
    return new Response('no fresh brief');
  }

  const store = getStore('push');
  if ((await store.get('last-notified')) === latest.date) {
    console.log('already notified for', latest.date);
    return new Response('already notified');
  }
  const subs = (await store.get('subs', { type: 'json' })) ?? [];
  if (subs.length === 0) {
    console.log('no subscribers');
    return new Response('no subscribers');
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, privateKey);
  const payloadFor = (lang) =>
    JSON.stringify({
      title: lang === 'en' ? 'Your morning shot is ready' : 'Tvůj ranní shot je připraven',
      body: `${latest.headline?.[lang] ?? latest.headline?.cs ?? ''} · ${countLabel(latest.itemCount, lang)}`,
      badge: 1,
    });
  const payloads = { cs: payloadFor('cs'), en: payloadFor('en') };

  const alive = [];
  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, payloads[sub.lang === 'en' ? 'en' : 'cs']);
      alive.push(sub);
      sent++;
    } catch (err) {
      const code = err?.statusCode;
      if (code === 404 || code === 410) {
        console.log('dropping dead subscription');
      } else {
        console.error('send failed:', code ?? err);
        alive.push(sub);
      }
    }
  }
  await store.setJSON('subs', alive);
  await store.set('last-notified', latest.date);
  console.log(`sent ${sent}/${subs.length}`);
  return new Response(`sent ${sent}`);
};

/** "7 novinek" / "7 stories" — mirrors itemCountLabel in src/lib/format.ts. */
function countLabel(n, lang) {
  if (lang === 'cs') {
    if (n === 1) return '1 novinka';
    if (n >= 2 && n <= 4) return `${n} novinky`;
    return `${n} novinek`;
  }
  return n === 1 ? '1 story' : `${n} stories`;
}

export const config = { schedule: '15 5 * * *' };
