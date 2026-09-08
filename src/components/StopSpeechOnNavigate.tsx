import { useEffect, useRef } from 'react';
import { usePathname } from 'expo-router';
import { stopAllSpeech } from '../services/audioBus';

/**
 * Cuts tapped-word speech whenever the route changes.
 *
 * Of the screens that start speech, only one stopped it on unmount, so leaving
 * a screen mid-utterance left audio running with nothing holding a handle to
 * it — and the next tap then added a second voice.
 *
 * Deliberately `stopAllSpeech` and not `stopAllAudio`: Quran recitation and
 * story narration are long-form and are meant to keep playing while the user
 * moves around, which is the whole point of the lock-screen controls.
 */
export default function StopSpeechOnNavigate() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    // Nothing is speaking on the very first render, and a screen that speaks on
    // mount would otherwise be cut off by its own arrival.
    if (first.current) {
      first.current = false;
      return;
    }
    stopAllSpeech();
  }, [pathname]);

  return null;
}
