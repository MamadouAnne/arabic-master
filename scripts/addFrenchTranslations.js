#!/usr/bin/env node
/**
 * Add French (and fill English) ayah translations to the generated surah data.
 * - English translation: Quran.com resource 131 (The Clear Quran)
 * - French translation:  Quran.com resource 136 (Hamidullah)
 * Word-by-word French is not available on Quran.com, so words stay English.
 *
 * Idempotent + resumable: skips files whose ayahs already have translationFr.
 * Usage: node scripts/addFrenchTranslations.js
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://api.quran.com/api/v4';
const EN_ID = 20;
const FR_ID = 136;

function clean(t) {
  return (t || '')
    .replace(/<sup[^>]*>.*?<\/sup>/gis, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchWithRetry(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

const cache = {};
async function getTrans(surahNum) {
  if (cache[surahNum]) return cache[surahNum];
  const url = `${BASE}/verses/by_chapter/${surahNum}?translations=${EN_ID},${FR_ID}&fields=text_uthmani&per_page=300`;
  const j = await fetchWithRetry(url);
  const map = {};
  for (const v of j.verses) {
    const byId = {};
    for (const t of v.translations || []) byId[t.resource_id] = clean(t.text);
    map[v.verse_number] = { en: byId[EN_ID] || '', fr: byId[FR_ID] || '' };
  }
  cache[surahNum] = map;
  return map;
}

function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return walk(p);
    return e.name.endsWith('.ts') && e.name !== 'index.ts' && e.name !== 'allSurahs.ts' ? [p] : [];
  });
}

async function main() {
  const root = path.join(__dirname, '..', 'src', 'data', 'arabic', 'quran', 'surahs');
  const files = walk(root).sort();
  let done = 0, skipped = 0, failed = 0;
  for (const file of files) {
    const base = path.basename(file);
    const surahNum = parseInt(base.slice(0, 3), 10);
    if (!surahNum) { continue; }
    const content = fs.readFileSync(file, 'utf8');
    const m = content.match(/export const (\w+): Ayah\[\] = ([\s\S]*?);\s*\n\s*export default \1;/);
    if (!m) { console.log('  ! no array match:', base); failed++; continue; }
    let ayahs;
    try { ayahs = JSON.parse(m[2]); } catch (e) { console.log('  ! JSON parse fail:', base, e.message); failed++; continue; }
    if (ayahs.length && ayahs.every((a) => a.translationFr && a.translation)) { skipped++; continue; }
    let map;
    try { map = await getTrans(surahNum); } catch (e) { console.log('  ! fetch fail surah', surahNum, e.message); failed++; continue; }
    for (const a of ayahs) {
      const tr = map[a.ayahNumber];
      if (!tr) continue;
      if (tr.en) a.translation = tr.en;
      a.translationFr = tr.fr;
    }
    const rebuilt = content.replace(m[0], `export const ${m[1]}: Ayah[] = ${JSON.stringify(ayahs, null, 2)};\n\nexport default ${m[1]};`);
    fs.writeFileSync(file, rebuilt, 'utf8');
    done++;
    console.log(`  ✓ ${base} (surah ${surahNum}, ${ayahs.length} ayahs)`);
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`\nDone. updated=${done} skipped=${skipped} failed=${failed}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
