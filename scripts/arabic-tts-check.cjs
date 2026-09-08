/**
 * Arabic TTS quality check.  node scripts/arabic-tts-check.cjs
 *
 * Two things this pins down, both measured against the real endpoint:
 *
 *  1. Google's translate_tts does not take a continuous rate. Every value from
 *     0.5 to 1 returns byte-identical audio; only ~0.2-0.3 and <=0.1 differ. A
 *     caller asking for 0.7 therefore gets normal speed, so the app must map
 *     onto the three tempos that exist rather than pass a number through.
 *  2. The clip is rendered at the requested tempo, so it must be played back at
 *     rate 1.0. Time-stretching it afterwards is what made slow Arabic warble.
 */
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'services', 'speech', 'arabicTTS.ts'), 'utf8');
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS  ' : 'FAIL  ') + m); if (!c) fail++; };

ok(!/setPlaybackRate/.test(src.replace(/\/\/.*/g, '')),
   'no setPlaybackRate on the rendered clip (no client-side time-stretch)');
ok(/ttsspeed=\$\{ttsSpeed\}/.test(src), 'tempo is requested from Google, not applied on playback');

const fn = src.match(/function googleTtsSpeed[\s\S]*?\n\}/);
ok(!!fn, 'googleTtsSpeed mapping exists');
if (fn) {
  // strip the TypeScript annotations so the function can be evaluated here
  const js = fn[0].replace(/: *number/g, '');
  const googleTtsSpeed = new Function(`${js}; return googleTtsSpeed;`)();
  const cases = [[1.0, 1], [0.95, 1], [0.9, 1], [0.75, 0.24], [0.7, 0.24], [0.5, 0.24], [0.45, 0.24], [0.3, 0.1], [0.1, 0.1]];
  for (const [req, want] of cases) {
    ok(googleTtsSpeed(req) === want, `speed ${req} -> ttsspeed ${googleTtsSpeed(req)} (expected ${want})`);
  }
  ok(new Set(cases.map(([r]) => googleTtsSpeed(r))).size === 3, 'only the three tempos Google honours are ever requested');
}
console.log(fail ? `\n${fail} FAILURE(S)` : '\nAll Arabic TTS checks passed');
process.exit(fail ? 1 : 0);
