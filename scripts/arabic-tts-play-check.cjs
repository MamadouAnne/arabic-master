/**
 * Does Arabic speech actually produce audio?  node scripts/arabic-tts-play-check.cjs
 *
 * This exists because a "correct-looking" refactor shipped total silence twice.
 * The engine cancels itself via a generation counter, so any change that bumps
 * that counter during start-up kills the utterance before its first chunk and
 * every unit-level assertion still passes. The only assertion that catches it
 * is: after calling playArabicLines, did anything actually play?
 *
 * Runs the real src/services/speech/arabicTTS.ts with expo modules stubbed.
 */
const Module = require('module'), fs = require('fs'), path = require('path'), babel = require('@babel/core');
const ROOT = path.join(__dirname, '..');

let fetched = [], played = [], spokeOnDevice = [], paused = 0;
let failFetch = false;

const stubs = {
  'expo-audio': {
    setAudioModeAsync: async () => {},
    createAudioPlayer: (uri) => {
      const p = {
        uri, shouldCorrectPitch: true, _l: [],
        addListener(_, fn) { p._l.push(fn); return { remove() {} }; },
        play() { played.push(uri); setTimeout(() => p._l.forEach(f => f({ didJustFinish: true, playing: false, currentTime: 1, duration: 1 })), 10); },
        pause() { paused++; },
        remove() {},
        setPlaybackRate() { throw new Error('must not resample the rendered clip'); },
      };
      return p;
    },
  },
  'expo-speech': {
    stop() {},
    speak(t) { spokeOnDevice.push(t); },
    getAvailableVoicesAsync: async () => ([
      { identifier: 'com.apple.voice.compact.ar-001.Maged', language: 'ar-001', quality: 'Default' },
      { identifier: 'com.apple.voice.enhanced.ar-001.Majed', language: 'ar-001', quality: 'Enhanced' },
    ]),
  },
  'react-native': { Platform: { OS: 'ios', select: (o) => o.ios ?? o.default } },
  '@react-native-async-storage/async-storage': { getItem: async () => null, setItem: async () => {} },
  'expo-file-system': {
    File: class { constructor(a, b) { this.uri = 'file://' + (b || a); } write() {} delete() {} },
    Paths: { cache: '/cache' },
  },
};
const orig = Module._load;
Module._load = (r, p, m) => (stubs[r] ? stubs[r] : orig.apply(Module, [r, p, m]));
require.extensions['.ts'] = (m, f) => m._compile(babel.transformSync(fs.readFileSync(f, 'utf8'),
  { filename: f, presets: ['@babel/preset-typescript'], plugins: ['@babel/plugin-transform-modules-commonjs'] }).code, f);

global.fetch = async (url) => {
  if (failFetch) throw new Error('offline');
  fetched.push(url);
  return { ok: true, blob: async () => ({}) };
};
global.FileReader = class {
  readAsDataURL() { this.result = 'data:audio/mp3;base64,QUJD'; setTimeout(() => this.onloadend(), 0); }
};
global.atob = (b) => Buffer.from(b, 'base64').toString('binary');

const tts = require(path.join(ROOT, 'src', 'services', 'speech', 'arabicTTS.ts'));
// Load the other services too, so every producer registers on the audio bus
// exactly as it does in the app. Importing arabicTTS alone made this file pass
// against a build that shipped total silence: audioService never registered, so
// the claim/stop cycle that killed each utterance could not fire.
require(path.join(ROOT, 'src', 'services', 'audioService.ts'));
const wait = (ms) => new Promise(r => setTimeout(r, ms));
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS  ' : 'FAIL  ') + m); if (!c) fail++; };

(async () => {
  // THE test: a plain call must actually play something.
  fetched = []; played = [];
  await tts.speakArabic('السلام عليكم');
  ok(played.length > 0, `speakArabic actually played audio (${played.length} clip(s))`);
  ok(fetched.length > 0, `it fetched from Google (${fetched.length} request(s))`);

  // Multi-line, as the reading screen uses it.
  fetched = []; played = [];
  const lines = [];
  await tts.playArabicLines(['بِسْمِ اللهِ', '', 'الرَّحْمَنِ الرَّحِيم'], { onLineStart: (i) => lines.push(i) });
  ok(played.length === 2, `playArabicLines played both non-empty lines (${played.length})`);
  ok(lines.join(',') === '0,2', `onLineStart indices map onto the input (${lines.join(',')})`);

  // Tempo must ride in the request, never on playback.
  fetched = [];
  await tts.speakArabic('اختبار', { speed: 0.5 });
  ok(/ttsspeed=0\.24/.test(fetched[0] || ''), `slow speech requests ttsspeed=0.24 (${(fetched[0]||'').match(/ttsspeed=[\d.]+/)})`);
  fetched = [];
  await tts.speakArabic('اختبار', { speed: 1 });
  ok(/ttsspeed=1/.test(fetched[0] || ''), 'normal speech requests ttsspeed=1');

  // Offline must not be silence.
  failFetch = true; played = []; spokeOnDevice = [];
  await tts.speakArabic('بدون إنترنت');
  ok(spokeOnDevice.length > 0, `offline falls back to on-device speech (${spokeOnDevice.length})`);
  failFetch = false;

  // "Play all": the reading screen awaits speak() once per sentence, through
  // useArabicSpeech -> audioService -> arabicTTS. When each call cancelled
  // itself the loop completed in milliseconds having played nothing, which is
  // what "play all is not working" looked like.
  const audioService = require(path.join(ROOT, 'src', 'services', 'audioService.ts')).audioService;
  played = [];
  for (const sentence of ['الجملة الأولى', 'الجملة الثانية', 'الجملة الثالثة']) {
    await audioService.speakArabic({ text: sentence });
  }
  ok(played.length === 3, `play-all spoke every sentence in turn (${played.length}/3)`);

  // stop() must silence.
  played = [];
  tts.speakArabic('نص طويل جدا لكي يستمر التشغيل لبعض الوقت');
  await wait(5);
  tts.stopArabic();
  const at = played.length;
  await wait(80);
  ok(played.length === at, `stopArabic halted playback (${played.length - at} extra)`);

  console.log(fail ? `\n${fail} FAILURE(S)` : '\nAll Arabic playback checks passed');
  process.exit(fail ? 1 : 0);
})();
