/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrintSettings } from '../../types';

/**
 * Units factory - converts measurements between screen (px) and print (mm/pt) modes
 */
export interface UnitsResult {
  fontPx: number;
  u: (mm: number) => string;
  uF: (factor: number) => string;
  uFn: (factor: number) => number;
  uN: (mm: number) => number;
  contentWidth: number;
  runningHeadTop: number;
}

export function makeUnits(
  mode: 'screen' | 'print',
  scale: number,
  settings: PrintSettings,
  paperSize: { width: number; height: number }
): UnitsResult {
  const ptToMm = 0.35277;

  if (mode === 'screen') {
    const fontPx = settings.fontSize * ptToMm * scale;
    return {
      fontPx,
      u: (mm: number) => `${mm * scale}px`,
      uF: (factor: number) => `${fontPx * factor}px`,
      uFn: (factor: number) => fontPx * factor,
      uN: (mm: number) => mm * scale,
      contentWidth: (paperSize.width - settings.margins.inner - settings.margins.outer) * scale,
      runningHeadTop: (settings.margins.top / 2.5) * scale,
    };
  } else {
    const fontPt = settings.fontSize;
    return {
      fontPx: fontPt,   // treated as pt in print mode
      u: (mm: number) => `${mm}mm`,
      uF: (factor: number) => `${fontPt * factor}pt`,
      uFn: (factor: number) => fontPt * factor,
      uN: (mm: number) => mm,
      contentWidth: paperSize.width - settings.margins.inner - settings.margins.outer,  // mm
      runningHeadTop: settings.margins.top / 2.5,  // mm
    };
  }
}
