// engine.ts — conversion engine (demo stubs)
import { getMapping } from './mappings';
import type { TargetModel } from './mappings';

export type ConvertResult = {
  outZipPath: string;
  report: string;
  stats: {
    stylesProcessed: number;
    stylesDowngraded: number;
    soundsProcessed: number;
    soundsRemapped: number;
    pcmsProcessed: number;
    pcmsFallbacks: number;
    warnings: number;
  };
};

export async function convertSet({ tempDir, originModel, targetModel, zipOutPath, fs, zipArchive }:
  { tempDir: string; originModel: string; targetModel: TargetModel; zipOutPath: string; fs: any; zipArchive: any }
): Promise<ConvertResult> {
  const mapping = getMapping(originModel, targetModel);
  const start = Date.now();

  let stylesProcessed = 0, stylesDowngraded = 0;
  let soundsProcessed = 0, soundsRemapped = 0;
  let pcmsProcessed = 0, pcmsFallbacks = 0;
  let warnings = 0;

  const allFiles: string[] = await fs.readdir(tempDir).catch(() => []);
  const styles = allFiles.filter(f => /style/i.test(f));
  const sounds = allFiles.filter(f => /sound/i.test(f));
  const pcms = allFiles.filter(f => /pcm|wav/i.test(f));

  const styleNames = styles.map(s => s.replace(/_/g, ' ').replace(/style/i, '').trim() || s);
  const soundNames = sounds.map(s => s.replace(/_/g, ' ').replace(/sound/i, '').trim() || s);
  const pcmNames = pcms.map(p => p.replace(/_/g, ' ').replace(/\\.wav$/i, '').trim() || p);

  const reportLines: string[] = [];
  reportLines.push(`KORG Downgrade Report`);
  reportLines.push(`Origin: ${originModel} -> Target: ${targetModel}`);
  reportLines.push(`Mapping present: ${mapping ? 'Yes' : 'No'}`);
  reportLines.push('');

  for (const s of styleNames) {
    stylesProcessed++;
    const mapped = mapping?.styles?.[s];
    if (mapped) { stylesDowngraded++; reportLines.push(`STYLE: ${s} -> ${mapped}`); }
    else { reportLines.push(`STYLE: ${s} -> (no mapping) KEEP ${s}`); }
  }

  for (const s of soundNames) {
    soundsProcessed++;
    const mapped = mapping?.sounds?.[s];
    if (mapped) { soundsRemapped++; reportLines.push(`SOUND: ${s} -> ${mapped}`); }
    else { reportLines.push(`SOUND: ${s} -> (no mapping) KEEP ${s}`); }
  }

  for (const p of pcmNames) {
    pcmsProcessed++;
    const mapped = mapping?.pcms?.[p];
    if (mapped) { pcmsFallbacks++; reportLines.push(`PCM: ${p} -> fallback ${mapped}`); }
    else { reportLines.push(`PCM: ${p} -> (no mapping) KEEP ${p}`); }
  }

  reportLines.push('');
  reportLines.push('Summary:');
  reportLines.push(`Styles processed: ${stylesProcessed}, downgraded: ${stylesDowngraded}`);
  reportLines.push(`Sounds processed: ${soundsProcessed}, remapped: ${soundsRemapped}`);
  reportLines.push(`PCMs processed: ${pcmsProcessed}, fallbacks: ${pcmsFallbacks}`);
  reportLines.push(`Warnings: ${warnings}`);
  reportLines.push(`Processing time (sec): ${Math.round((Date.now() - start) / 1000)}`);

  const report = reportLines.join('\\n');
  try { await fs.writeFile(`${tempDir}/CONVERSION_REPORT.txt`, report, 'utf8'); } catch (e) {}

  try { await zipArchive.zip(tempDir, zipOutPath); } catch (e) { throw new Error('ZIP failed: ' + String(e)); }

  return { outZipPath: zipOutPath, report, stats: { stylesProcessed, stylesDowngraded, soundsProcessed, soundsRemapped, pcmsProcessed, pcmsFallbacks, warnings } };
}
