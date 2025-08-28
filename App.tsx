// App.tsx — KORG SET Converter (Multi-model: PA5X/PA4X → PA3X/PA600/PA900)
// ---------------------------------------------------------------------------------
// نسخه کامل‌تر با پشتیبانی از چند مدل مقصد
// ⚠️ هنوز دمو هست: بخش تبدیل واقعی (پارسر فایل‌های کرگ) باید تکمیل بشه.
// ---------------------------------------------------------------------------------

import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';

// Types
type TargetModel = 'PA3X' | 'PA600' | 'PA900';

type ConvertOptions = {
  target: TargetModel;
  inputZipPath: string;
};

type ConvertResult = {
  outputZipPath: string;
  report: string;
  stats: {
    stylesProcessed: number;
    stylesDowngraded: number;
    soundsProcessed: number;
    soundsRemapped: number;
    pcmsProcessed: number;
    pcmsReencoded: number;
  };
};

// --- Stub: انتخاب فایل (باید با DocumentPicker عوض بشه) ---
async function pickZipFile(): Promise<string | null> {
  Alert.alert('Demo picker', 'نسخه دمو: مسیر فرضی برگردانده می‌شود.');
  return '/storage/emulated/0/Download/SET_DEMO.zip';
}

// --- Mapping نمونه برای چند مدل ---
const MAPS: Record<TargetModel, any> = {
  PA3X: {
    styles: { 'POP\nModern Ballad': 'POP\nModern Ballad (PA3X)' },
    sounds: { 'Grand Piano 4K': 'Grand Piano 3' },
    pcms: { 'StudioStringsHQ': 'LegacyStrings' },
  },
  PA600: {
    styles: { 'POP\nModern Ballad': 'POP\nBallad (PA600)' },
    sounds: { 'Grand Piano 4K': 'Grand Piano 2' },
    pcms: { 'StudioStringsHQ': 'ClassicStrings' },
  },
  PA900: {
    styles: { 'POP\nModern Ballad': 'POP\nBallad (PA900)' },
    sounds: { 'Grand Piano 4K': 'Grand Piano 2 Deluxe' },
    pcms: { 'StudioStringsHQ': 'OrchStrings' },
  },
};

// --- Core Conversion (دمو) ---
async function convertKorgSet(options: ConvertOptions, onLog?: (line: string) => void): Promise<ConvertResult> {
  const log = (s: string) => onLog?.(s);
  log?.('شروع پردازش…');

  // فرض می‌کنیم فایل ست شامل این آیتم‌هاست
  const foundStyles = ['POP\nModern Ballad'];
  const foundSounds = ['Grand Piano 4K'];
  const foundPcms = ['StudioStringsHQ'];

  const map = MAPS[options.target];

  let stylesDowngraded = 0;
  let soundsRemapped = 0;
  let pcmsReencoded = 0;

  const styleResults = foundStyles.map((s) => {
    const mapped = map.styles[s] || s;
    if (mapped !== s) stylesDowngraded++;
    return `${s} → ${mapped}`;
  });

  const soundResults = foundSounds.map((s) => {
    const mapped = map.sounds[s] || s;
    if (mapped !== s) soundsRemapped++;
    return `${s} → ${mapped}`;
  });

  const pcmResults = foundPcms.map((s) => {
    const mapped = map.pcms[s] || s;
    if (mapped !== s) pcmsReencoded++;
    return `${s} → ${mapped}`;
  });

  const report = [
    `KORG SET Converter Report`,
    `Target: ${options.target}`,
    `--- Styles ---`,
    ...styleResults,
    `--- Sounds ---`,
    ...soundResults,
    `--- PCM ---`,
    ...pcmResults,
  ].join('\\n');

  return {
    outputZipPath: `/storage/emulated/0/Download/NEW_SET_${options.target}.zip`,
    report,
    stats: {
      stylesProcessed: foundStyles.length,
      stylesDowngraded,
      soundsProcessed: foundSounds.length,
      soundsRemapped,
      pcmsProcessed: foundPcms.length,
      pcmsReencoded,
    },
  };
}

// --- UI ---
export default function App() {
  const [pickedPath, setPickedPath] = useState<string | null>(null);
  const [target, setTarget] = useState<TargetModel>('PA3X');
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<ConvertResult | null>(null);

  const pushLog = (s: string) => setLogs((prev) => [...prev, s]);

  const onPick = async () => {
    setResult(null);
    const p = await pickZipFile();
    if (p) {
      setPickedPath(p);
      pushLog(`فایل انتخاب شد: ${p}`);
    }
  };

  const onConvert = async () => {
    if (!pickedPath) {
      Alert.alert('هشدار', 'اول فایل .zip ست رو انتخاب کن.');
      return;
    }
    setBusy(true);
    setLogs([]);
    try {
      const res = await convertKorgSet({ target, inputZipPath: pickedPath }, (l) => pushLog(l));
      setResult(res);
    } catch (e: any) {
      Alert.alert('خطا در تبدیل', e?.message || 'مشکلی پیش آمد');
      pushLog(`❌ Error: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1020' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>KORG Set Converter</Text>
        <Text style={{ color: '#c6d0f5', marginBottom: 8 }}>پشتیبانی: PA5X/PA4X → PA3X/PA600/PA900</Text>

        <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
          <TouchableOpacity onPress={onPick} style={{ backgroundColor: '#1f2a4a', padding: 12, borderRadius: 10 }}>
            <Text style={{ color: 'white' }}>انتخاب فایل SET</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={busy} onPress={onConvert} style={{ backgroundColor: busy ? '#3b3b3b' : '#2f7d32', padding: 12, borderRadius: 10 }}>
            {busy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white' }}>تبدیل</Text>}
          </TouchableOpacity>
        </View>

        {pickedPath && <Text style={{ color: '#a5b4fc' }}>فایل انتخاب شده: {pickedPath}</Text>}

        <View style={{ marginTop: 12, backgroundColor: '#12172b', borderRadius: 10, padding: 12, height: 160 }}>
          <ScrollView>
            {logs.map((l, i) => (
              <Text key={i} style={{ color: 'white' }}>• {l}</Text>
            ))}
          </ScrollView>
        </View>

        {result && (
          <View style={{ marginTop: 12, backgroundColor: '#0f172a', borderRadius: 10, padding: 12 }}>
            <Text style={{ color: 'white', fontWeight: '700' }}>نتیجه:</Text>
            <Text style={{ color: 'white' }}>فایل خروجی: {result.outputZipPath}</Text>
            <Text style={{ color: 'white', marginTop: 6 }}>📄 گزارش:</Text>
            <Text style={{ color: '#94a3b8' }}>{result.report}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
