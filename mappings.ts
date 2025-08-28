// mappings.ts — mapping DB (demo)
export type TargetModel = 'PA3X' | 'PA600' | 'PA900';

export const MAPPINGS: Record<string, any> = {
  PA4X: {
    PA3X: {
      meta: { version: '0.2-demo' },
      styles: { 'POP Modern Ballad': 'POP Modern Ballad (PA3X)' },
      sounds: { 'Grand Piano 4K': 'Grand Piano 3', 'Analog Pad X': 'Analog Pad' },
      pcms: { 'StudioStringsHQ': 'LegacyStrings' }
    },
    PA600: {
      meta: { version: '0.1-demo' },
      styles: {},
      sounds: { 'Grand Piano 4K': 'Grand Piano 2' },
      pcms: {}
    }
  },
  PA5X: {
    PA900: {
      meta: { version: '0.1-demo' },
      styles: {},
      sounds: {},
      pcms: {}
    }
  }
};

export function getMapping(origin: string, target: TargetModel) {
  return (MAPPINGS as any)[origin]?.[target] || null;
}
