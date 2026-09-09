/**
 * Microsoft Edge's read-aloud voices.
 *
 * These are Azure neural voices, and they are free and keyless: the same
 * service Edge uses for "read aloud" on a web page. It is what the opus-report
 * project narrates with, and it is the only way to get a genuinely good MALE
 * voice on an iPhone. Apple exposes no good male voice to third-party apps —
 * the ones a stock phone has are the old Fred and the Eloquence novelties —
 * and the Google endpoint we used before serves exactly one female voice per
 * language.
 *
 * Synthesis is WebSocket-only, so this is more machinery than a plain fetch:
 *
 *   1. Build a Sec-MS-GEC token, which is a SHA-256 of the current time in
 *      Windows file-time, rounded down to five minutes, joined to a fixed
 *      client token. The hash is done here in plain JavaScript rather than
 *      with expo-crypto, which is only a transitive dependency and so may not
 *      be in the installed binary. This has to keep working over the air.
 *   2. Open the socket, send a config frame, then an SSML frame.
 *   3. Audio arrives as binary frames, each with a small text header whose
 *      length is the first two bytes. Concatenate what follows.
 *   4. `Path:turn.end` on a text frame means the utterance is complete.
 */
import { File, Paths } from 'expo-file-system';

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const GEC_VERSION = '1-143.0.3650.75';
const WIN_EPOCH_SECONDS = 11644473600;
const SYNTH_TIMEOUT_MS = 12000;

export type EdgeGender = 'female' | 'male';
export type EdgeLang = 'en' | 'fr';

/** Warm, unhurried voices. Christopher is the one opus-report narrates with. */
const VOICES: Record<EdgeLang, Record<EdgeGender, string>> = {
  en: { female: 'en-US-AriaNeural', male: 'en-US-ChristopherNeural' },
  fr: { female: 'fr-FR-DeniseNeural', male: 'fr-FR-HenriNeural' },
};

export function voiceFor(lang: EdgeLang, gender: EdgeGender): string {
  return VOICES[lang][gender];
}

// ---------------------------------------------------------------------------
// SHA-256, plain JavaScript. No native module, so it cannot fail to link.
// ---------------------------------------------------------------------------

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function sha256Hex(ascii: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < ascii.length; i++) bytes.push(ascii.charCodeAt(i) & 0xff);

  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  // Length as a 64-bit big-endian value; our inputs never exceed 32 bits.
  bytes.push(0, 0, 0, 0);
  bytes.push((bitLength >>> 24) & 0xff, (bitLength >>> 16) & 0xff, (bitLength >>> 8) & 0xff, bitLength & 0xff);

  const h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const w = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < bytes.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      const j = offset + i * 4;
      w[i] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, hh] = [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7]];
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e;
      e = (d + t1) >>> 0;
      d = c; c = b; b = a;
      a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
  }

  let out = '';
  for (let i = 0; i < 8; i++) out += h[i].toString(16).padStart(8, '0');
  return out;
}

export function secMsGec(now = Date.now()): string {
  let ticks = Math.floor(now / 1000) + WIN_EPOCH_SECONDS;
  ticks -= ticks % 300; // the token is only valid to a five-minute window
  // 100-nanosecond intervals. Beyond 2^53 an integer would lose precision, so
  // build the digits rather than multiplying.
  const ticksIn100ns = `${ticks}0000000`;
  return sha256Hex(`${ticksIn100ns}${TRUSTED_CLIENT_TOKEN}`).toUpperCase();
}

// ---------------------------------------------------------------------------

function uuid(): string {
  let s = '';
  for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}

/** SSML is XML; unescaped prose would break the request. */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Speak one piece of text, resolving with the MP3 bytes. */
export function synthesize(text: string, voice: string, lang: EdgeLang, rate = '-4%'): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const url =
      `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` +
      `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}` +
      `&Sec-MS-GEC=${secMsGec()}&Sec-MS-GEC-Version=${GEC_VERSION}&ConnectionId=${uuid()}`;

    let socket: WebSocket;
    try {
      // React Native's WebSocket takes a third options argument for headers.
      // The DOM typings do not describe it, hence the cast.
      socket = new (WebSocket as any)(url, undefined, {
        headers: {
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
          Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
    } catch (e) {
      reject(e);
      return;
    }
    socket.binaryType = 'arraybuffer';

    const parts: Uint8Array[] = [];
    let total = 0;
    let done = false;

    const finish = (fn: () => void) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        socket.close();
      } catch {}
      fn();
    };

    const timer = setTimeout(() => finish(() => reject(new Error('edge-tts-timeout'))), SYNTH_TIMEOUT_MS);

    socket.onopen = () => {
      const stamp = new Date().toString();
      socket.send(
        `X-Timestamp:${stamp}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
          `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false",` +
          `"wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`
      );
      const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
      const ssml =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${locale}'>` +
        `<voice name='${voice}'><prosody pitch='+0Hz' rate='${rate}' volume='+0%'>${escapeXml(text)}</prosody>` +
        `</voice></speak>`;
      socket.send(
        `X-RequestId:${uuid()}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${stamp}Z\r\nPath:ssml\r\n\r\n${ssml}`
      );
    };

    socket.onmessage = (event: any) => {
      const data = event.data;
      if (typeof data === 'string') {
        if (data.includes('Path:turn.end')) {
          if (!total) {
            finish(() => reject(new Error('edge-tts-empty')));
            return;
          }
          const merged = new Uint8Array(total);
          let at = 0;
          for (const part of parts) {
            merged.set(part, at);
            at += part.length;
          }
          finish(() => resolve(merged));
        }
        return;
      }
      // Binary: two-byte big-endian header length, header, then audio.
      const bytes = new Uint8Array(data as ArrayBuffer);
      if (bytes.length < 2) return;
      const headerLength = (bytes[0] << 8) | bytes[1];
      const audio = bytes.subarray(2 + headerLength);
      if (audio.length) {
        parts.push(audio);
        total += audio.length;
      }
    };

    socket.onerror = () => finish(() => reject(new Error('edge-tts-socket')));
    socket.onclose = () => finish(() => reject(new Error('edge-tts-closed')));
  });
}

/** Synthesize and drop the audio in the cache, returning a playable uri. */
export async function synthesizeToFile(
  text: string,
  lang: EdgeLang,
  gender: EdgeGender,
  rate = '-4%'
): Promise<string> {
  const bytes = await synthesize(text, voiceFor(lang, gender), lang, rate);
  const file = new File(Paths.cache, `story-${Date.now()}-${Math.floor(Math.random() * 1e6)}.mp3`);
  file.write(bytes);
  return file.uri;
}

export default { synthesize, synthesizeToFile, voiceFor, secMsGec };
