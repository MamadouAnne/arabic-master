/**
 * Audio overlap regression check.  node scripts/audio-overlap-check.cjs
 *
 * The app has five independent audio producers, each correct on its own but
 * unaware of the others: only audioService stopped one neighbour. Starting a
 * recitation while a tapped word was speaking produced two streams, and there
 * was no way to ask the app to be quiet.
 *
 * src/services/audioBus.ts is the coordinator. This checks the contract:
 *   - starting anything silences every other producer, and never itself
 *     (an ayah-to-ayah handover must not stop the recitation it continues)
 *   - stopAllSpeech leaves long-form playback alone, so recitation survives
 *     navigation and keeps its lock-screen session
 *   - stopAllAudio silences everything
 *   - one producer throwing on stop does not prevent the rest from stopping
 */
const path = require('path'), fs = require('fs'), babel = require('@babel/core');
require.extensions['.ts'] = (m, f) => m._compile(babel.transformSync(fs.readFileSync(f, 'utf8'),
  { filename: f, presets: ['@babel/preset-typescript'], plugins: ['@babel/plugin-transform-modules-commonjs'] }).code, f);
const bus = require(path.join(__dirname, '..', 'src', 'services', 'audioBus.ts'));

let stopped = [];
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS  ' : 'FAIL  ') + m); if (!c) fail++; };

bus.registerAudioProducer('arabicTTS', 'speech', () => stopped.push('arabicTTS'));
bus.registerAudioProducer('googleArabicTts', 'speech', () => stopped.push('googleArabicTts'));
bus.registerAudioProducer('audioService', 'speech', () => stopped.push('audioService'));
bus.registerAudioProducer('quran', 'longform', () => stopped.push('quran'));
bus.registerAudioProducer('story', 'longform', () => stopped.push('story'));

stopped = []; bus.claimAudio('quran');
ok(!stopped.includes('quran'), 'a producer never stops itself (ayah handover keeps playing)');
ok(stopped.includes('arabicTTS') && stopped.includes('googleArabicTts') && stopped.includes('story'),
   `starting recitation silenced the other four (${stopped.length} stopped)`);

stopped = []; bus.claimAudio('arabicTTS');
ok(stopped.includes('quran'), 'starting speech silences recitation (no two streams)');

stopped = []; bus.stopAllSpeech();
ok(!stopped.includes('quran') && !stopped.includes('story'),
   'stopAllSpeech leaves long-form playing (navigation keeps recitation alive)');
ok(stopped.length === 3, `stopAllSpeech stopped exactly the speech producers (${stopped.length})`);

stopped = []; bus.stopAllAudio();
ok(stopped.length === 5, `stopAllAudio stopped everything (${stopped.length})`);

bus.registerAudioProducer('broken', 'speech', () => { throw new Error('boom'); });
stopped = [];
try { bus.stopAllAudio(); } catch { ok(false, 'a throwing producer took the whole stop down'); }
ok(stopped.length === 5, `a producer that throws does not block the others (${stopped.length} still stopped)`);

console.log(fail ? `\n${fail} FAILURE(S)` : '\nAll audio-bus checks passed');
process.exit(fail ? 1 : 0);
