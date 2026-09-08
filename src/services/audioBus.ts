/**
 * One place that knows what is making sound.
 *
 * The app has three audio producers — arabicTTS (all Arabic speech),
 * quranAudioService (reciter MP3s) and storyAudioService (English narration).
 * Each already guards itself correctly (own generation counter, own player,
 * pause before release), but none of them knew the others existed, so a
 * recitation and a tapped word played over each other and there was no way to
 * ask the app to just be quiet.
 *
 * Producers register a stopper here rather than importing one another, which
 * keeps the services free of a dependency cycle. Registration is by channel:
 *
 *   `speech`   — short utterances the user triggered by tapping something.
 *   `longform` — recitation and story playback, which is allowed to continue
 *                across navigation because the lock-screen controls make that
 *                a deliberate feature.
 *
 * The rule: starting anything stops everything else. That is the behaviour a
 * listener expects, and it is the only one that cannot produce two voices.
 */

type Stopper = () => void | Promise<void>;
type Channel = 'speech' | 'longform';

const producers = new Map<string, { channel: Channel; stop: Stopper }>();

export function registerAudioProducer(id: string, channel: Channel, stop: Stopper) {
  producers.set(id, { channel, stop });
}

function runStop(id: string, entry: { stop: Stopper }) {
  try {
    const result = entry.stop();
    // Producers stop synchronously; a rejected promise here must not take the
    // caller down mid-playback.
    if (result && typeof (result as Promise<void>).catch === 'function') {
      (result as Promise<void>).catch(() => {});
    }
  } catch {
    // A producer that fails to stop must not prevent the others from stopping.
  }
}

/** Called by a producer as it starts. Silences every other producer. */
export function claimAudio(id: string) {
  for (const [key, entry] of producers) {
    if (key !== id) runStop(key, entry);
  }
}

/** Stop tapped-word speech, leaving recitation and stories playing. */
export function stopAllSpeech() {
  for (const [key, entry] of producers) {
    if (entry.channel === 'speech') runStop(key, entry);
  }
}

/** Stop absolutely everything. */
export function stopAllAudio() {
  for (const [key, entry] of producers) runStop(key, entry);
}
