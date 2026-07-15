import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

// Runs daily after the morning brief lands (03:04 UTC main, 05:05 UTC backup).
// Checks GitHub for today's brief and sends one push per subscriber. The
// VAPID private key lives in Netlify environment variables, never in the repo.
const RAW_INDEX =
  'https://raw.githubusercontent.com/vasekbrozka/AI-brief-app/refs/heads/claude/daily-ai-brief-app-b1qq0p/data/briefs/index.json';
const VAPID_PUBLIC_KEY =
  'BDM3FG_HdmoXa_wlZPrbcvGW99d5OodcIdAjsZ3LtPBtuOtFpVQN41m2LltNbZfjCFuCGuA51mffSdusGTnRkA0';
const VAPID_SUBJECT = 'https://aispresso.netlify.app';

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
  const payload = JSON.stringify({
    title: 'Tvůj ranní shot je připraven',
    body: 'Lokni si ☕️',
    badge: 1,
  });

  const alive = [];
  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, payload);
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

export const config = { schedule: '15 5 * * *' };
