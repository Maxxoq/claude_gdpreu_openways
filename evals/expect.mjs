// Expected crawler findings per fixture. Used by evals/run.sh (deterministic, no AI calls).
//   node evals/expect.mjs <fixture> <evidence.json>
import { readFileSync } from 'node:fs';

const [fixture, file] = process.argv.slice(2);
const ev = JSON.parse(readFileSync(file, 'utf8'));
const F = ev.findings;
const has = (id, level, re) => F.some((f) => f.id === id && (!level || f.level === level) && (!re || re.test(f.title + ' ' + f.evidence.join(' '))));

const EXPECT = {
  'bad-site': [
    ['L1 tracking cookies before consent (_ga, _fbp)', () => has('L1', 'presumptive violation', /_ga\b[\s\S]*_fbp|_fbp[\s\S]*_ga\b/)],
    ['L2 Hotjar storage before consent', () => has('L2', 'presumptive violation', /_hjSessionUser/)],
    ['L3 Meta pixel request before consent', () => has('L3', 'presumptive violation', /Meta Pixel/)],
    ['L4 trackers survive "reject"', () => has('L4', 'presumptive violation')],
    ['L6 no first-layer reject', () => has('L6', 'presumptive violation', /reject/i)],
    ['L8 pre-ticked marketing + statistics', () => has('L8', 'presumptive violation', /marketing/) && has('L8', null, /statistics/)],
    ['L12 no Consent Mode default', () => has('L12', 'warning')],
    ['L14 no withdrawal control', () => has('L14', 'presumptive violation')],
    ['L19 canvas fingerprinting', () => has('L19', 'warning', /canvas/)],
    ['unknown cookie shop_ab_test sent to human review', () => has('HR', 'needs human review', /shop_ab_test/)],
    ['PHPSESSID not flagged as tracker', () => !F.some((f) => ['L1', 'L4'].includes(f.id) && /PHPSESSID/.test(f.evidence.join(' ')))],
  ],
  'good-site': [
    ['no L1–L4 violations', () => !F.some((f) => ['L1', 'L2', 'L3', 'L4'].includes(f.id) && f.level === 'presumptive violation')],
    ['no L6 / L8 violations', () => !F.some((f) => ['L6', 'L8'].includes(f.id) && f.level === 'presumptive violation')],
    ['reject clicked on first layer, nothing tracked after', () => has('L4', 'observed fact')],
    ['accept and reject look equivalent', () => has('L7', 'observed fact')],
    ['withdrawal control found', () => has('L14', 'observed fact', /nastavení cookies/)],
    ['Google Analytics appears only after accept', () => has('L5', 'observed fact', /Google Analytics/)],
    ['cookie policy link found', () => has('L16', 'needs human review', /cookies\.html/)],
    ['no Consent Mode warning (defaults denied)', () => !has('L12')],
  ],
};

let fail = 0;
for (const [name, fn] of EXPECT[fixture] || []) {
  const ok = (() => { try { return fn(); } catch { return false; } })();
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) fail++;
}
console.log(`   -> ${(EXPECT[fixture] || []).length - fail} pass, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
