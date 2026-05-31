/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * PageRenderer — shared renderer used by both BookSpreadReader (screen) and
 * PrintSurface (print).  All layout logic lives here once.
 *
 * Screen mode:  pixel-based sizing driven by `scale` (px per mm).
 * Print mode:   mm/pt-based sizing via inline styles; no textarea / edit UI.
 */

import React from 'react';
import { Book, Page, PrintSettings, PRESET_PAPER_SIZES, TocEntry } from '../types';
import type { PaperTheme } from './BookSpreadReader';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface ScreenProps {
  mode: 'screen';
  scale: number;
  paperTheme: PaperTheme;
}

interface PrintProps {
  mode: 'print';
  paperTheme?: PaperTheme;
}

type ModeProps = ScreenProps | PrintProps;

export type PageRendererProps = {
  page: Page;
  pageIndex: number;      // 0-based
  isRightPage: boolean;
  book: Book;
  settings: PrintSettings;
} & ModeProps;

// ─────────────────────────────────────────────
// Helper: unit factory
// ─────────────────────────────────────────────
function makeUnits(mode: 'screen' | 'print', scale: number, settings: PrintSettings, paperSize: { width: number; height: number }) {
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

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function PageRenderer(props: PageRendererProps) {
  const { page, pageIndex, isRightPage, book, settings } = props;
  const mode = props.mode;
  const isScreen = mode === 'screen';
  const scale = isScreen ? (props as ScreenProps).scale : 1;
  const paperTheme = isScreen
    ? (props as ScreenProps).paperTheme
    : ((props as PrintProps).paperTheme ?? 'white');

  const paperSize = PRESET_PAPER_SIZES.find((p) => p.id === settings.paperSizeId) || PRESET_PAPER_SIZES[0];
  const { fontPx, u, uF, uFn, uN, contentWidth, runningHeadTop } = makeUnits(mode, scale, settings, paperSize);

  const pageNum = pageIndex + 1;
  const layoutType = page.layoutType;

  // ── Paper theme ──
  const themeMap = {
    creamy: { bg: 'bg-[#FAF6EC]', text: 'text-[#2C261F]', bgColor: '#FAF6EC', fgColor: '#2C261F' },
    white:  { bg: 'bg-[#FFFFFF]', text: 'text-slate-800',  bgColor: '#FFFFFF', fgColor: '#1e1e1e' },
    sepia:  { bg: 'bg-[#EBDCB9]', text: 'text-[#432A15]',  bgColor: '#EBDCB9', fgColor: '#432A15' },
    dark:   { bg: 'bg-[#2E2E2E]', text: 'text-[#ECECE2]',  bgColor: '#2E2E2E', fgColor: '#ECECE2' },
  };
  const themeEntry = themeMap[paperTheme] || themeMap.white;
  const themeClasses = isScreen
    ? { bg: themeEntry.bg, text: themeEntry.text }
    : { bg: '', text: '' };
  const printBg = isScreen ? '' : themeEntry.bgColor;
  const printFg = isScreen ? '' : themeEntry.fgColor;
  const printColorAdjust = isScreen ? {} : { WebkitPrintColorAdjust: 'exact' as const, printColorAdjust: 'exact' as const };

  const fontClass = {
    'Noto Serif KR':    'font-serif',
    'Inter':            'font-sans',
    'Fira Code':        'font-mono',
    'Playfair Display': 'font-serif',
  }[settings.fontFamily] || 'font-serif';

  const fontFamily =
    settings.fontFamily === 'Noto Serif KR'    ? '"Noto Serif KR", serif'
    : settings.fontFamily === 'Playfair Display' ? '"Playfair Display", serif'
    : settings.fontFamily === 'Fira Code'        ? '"Fira Code", monospace'
    : 'Inter, sans-serif';

  // ── Page dimensions ──
  const pageWidth  = u(paperSize.width);
  const pageHeight = u(paperSize.height);

  // ── Margins ──
  const pTopPx    = uN(settings.margins.top);
  const pBottomPx = uN(settings.margins.bottom);
  const pInnerPx  = uN(settings.margins.inner);
  const pOuterPx  = uN(settings.margins.outer);
  const paddingLeft  = isRightPage ? pInnerPx : pOuterPx;
  const paddingRight = isRightPage ? pOuterPx : pInnerPx;
  const unit = isScreen ? 'px' : 'mm';

  // ── Crop marks (print only) ──
  const cropMarks = !isScreen && settings.showCropMarks ? (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: '-3mm', left: '-3mm', width: '10mm', height: '0.2mm', backgroundColor: '#bbb' }} />
      <div style={{ position: 'absolute', top: '-3mm', left: '-3mm', width: '0.2mm', height: '10mm', backgroundColor: '#bbb' }} />
      <div style={{ position: 'absolute', top: '-3mm', right: '-3mm', width: '10mm', height: '0.2mm', backgroundColor: '#bbb' }} />
      <div style={{ position: 'absolute', top: '-3mm', right: '-3mm', width: '0.2mm', height: '10mm', backgroundColor: '#bbb' }} />
      <div style={{ position: 'absolute', bottom: '-3mm', left: '-3mm', width: '10mm', height: '0.2mm', backgroundColor: '#bbb' }} />
      <div style={{ position: 'absolute', bottom: '-3mm', left: '-3mm', width: '0.2mm', height: '10mm', backgroundColor: '#bbb' }} />
      <div style={{ position: 'absolute', bottom: '-3mm', right: '-3mm', width: '10mm', height: '0.2mm', backgroundColor: '#bbb' }} />
      <div style={{ position: 'absolute', bottom: '-3mm', right: '-3mm', width: '0.2mm', height: '10mm', backgroundColor: '#bbb' }} />
    </div>
  ) : null;

  // ── Shared helpers ──
  const contentWidthStr = `${contentWidth}${unit}`;

  // ─────────────────────────────────────────────
  // Layout renderers
  // ─────────────────────────────────────────────

  // ── COVER ──
  if (layoutType === 'cover') {
    const coverTheme = ({
      classic:  { bg: '#2C261F', fg: '#FAF6EC', accent: '#9A8272' },
      modern:   { bg: '#111111', fg: '#ffffff',  accent: '#888888' },
      academic: { bg: '#1E3A5F', fg: '#ffffff',  accent: '#6b9bd2' },
      zen:      { bg: '#f9f9f7', fg: '#333333',  accent: '#999999' },
    } as Record<string, { bg: string; fg: string; accent: string }>)[book.theme]
      || { bg: '#2C261F', fg: '#FAF6EC', accent: '#9A8272' };

    const accentLineW = `${uN(8)}${unit}`;
    const dividerW    = `${uN(10)}${unit}`;

    return (
      <div
        className={isScreen ? 'relative shadow-xl overflow-hidden flex flex-col items-center justify-center text-center print-sheet print-cover' : 'print-sheet print-cover'}
        style={{ width: pageWidth, height: pageHeight, backgroundColor: coverTheme.bg, color: coverTheme.fg, overflow: 'hidden', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
      >
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '12% 12%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isScreen ? `${uN(1.5)}px` : '2mm' }}>
            <span style={{ letterSpacing: '0.18em', fontFamily: 'sans-serif', textTransform: 'uppercase', opacity: 0.7, fontSize: uF(0.85) }}>
              {book.subtitle || ''}
            </span>
            <div style={{ width: accentLineW, height: isScreen ? 1 : '0.3mm', backgroundColor: coverTheme.accent, opacity: 0.4, marginTop: isScreen ? `${uN(2)}px` : '2mm' }} />
            <h1 style={{ fontFamily: 'serif', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.01em', margin: `${isScreen ? uN(4) : 4}${unit} 0 0`, padding: `0 ${isScreen ? uN(2) : 2}${unit}`, fontSize: uF(2.4) }}>
              {book.title}
            </h1>
            <div style={{ width: dividerW, height: isScreen ? 1 : '0.3mm', backgroundColor: coverTheme.fg, opacity: 0.25, margin: `${isScreen ? uN(3) : 3}${unit} 0` }} />
            <p style={{ fontFamily: 'serif', fontWeight: 500, marginTop: isScreen ? `${uN(2)}px` : '2mm', opacity: 0.85, fontSize: uF(1.2) }}>
              {book.author}
            </p>
          </div>
          <span style={{ fontFamily: 'monospace', letterSpacing: '0.2em', opacity: 0.6, fontSize: uF(0.75) }}>
            {book.publisher || ''}
          </span>
        </div>
      </div>
    );
  }

  // ── TOC ──
  if (layoutType === 'toc') {
    let entries: TocEntry[] = [];
    try { entries = JSON.parse(page.content); } catch { entries = []; }

    const pageBg = isScreen ? '' : '#fff';
    const pageColor = isScreen ? '' : '#000';

    return (
      <div
        className={isScreen ? `${themeClasses.bg} ${themeClasses.text} ${fontClass} relative shadow-xl overflow-hidden flex flex-col justify-between print-sheet` : 'print-sheet'}
        style={{
          width: pageWidth, height: pageHeight,
          paddingTop: `${pTopPx}${unit}`, paddingBottom: `${pBottomPx}${unit}`,
          paddingLeft: `${paddingLeft}${unit}`, paddingRight: `${paddingRight}${unit}`,
          ...(isScreen ? {} : { fontFamily, fontSize: `${settings.fontSize}pt`, lineHeight: settings.lineHeight, boxSizing: 'border-box', position: 'relative', ...printColorAdjust, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: pageBg, color: pageColor, overflow: 'hidden' }),
        }}
      >
        {cropMarks}
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: uF(1.8) }}>
          <span style={{ fontFamily: 'monospace', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.4, fontSize: uF(0.8) }}>INDEX</span>
          <h2 style={{ fontFamily: 'serif', fontWeight: 700, fontSize: uF(2.2), margin: `${uFn(0.5)}${unit} 0 ${uFn(0.6)}${unit}`, lineHeight: 1.1 }}>
            {page.title || '목차'}
          </h2>
          <div style={{ width: isScreen ? `${uN(6)}px` : '8mm', height: isScreen ? 1 : '0.2mm', backgroundColor: 'currentColor', opacity: 0.2 }} />
        </div>
        {/* Entries */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: uF(1.4) }}>
          {entries.map((entry, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: uF(0.15) }}>
                <span style={{ fontFamily: 'monospace', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.45, fontSize: uF(0.78) }}>{entry.chapter}</span>
                <span style={{ fontFamily: 'monospace', opacity: 0.45, fontSize: uF(0.78) }}>P.{entry.pageNum}</span>
              </div>
              <div style={{ height: isScreen ? 1 : '0.2mm', backgroundColor: 'currentColor', opacity: 0.08, marginBottom: uF(0.3) }} />
              <p style={{ fontFamily: 'serif', fontSize: uF(1.05), lineHeight: 1.4, margin: 0 }}>{entry.title}</p>
            </div>
          ))}
        </div>
        {/* Page number */}
        {settings.showPageNumbers && (
          <div style={{ position: 'absolute', bottom: `${uN(settings.margins.bottom / 2.5)}${unit}`, left: `${paddingLeft}${unit}`, width: contentWidthStr, display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: isScreen ? '11px' : '7.5pt', color: isScreen ? undefined : 'rgba(0,0,0,0.6)' }}>
            {!isRightPage
              ? <><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span><span style={{ opacity: 0 }}>.</span></>
              : <><span style={{ opacity: 0 }}>.</span><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span></>}
          </div>
        )}
      </div>
    );
  }

  // ── CHAPTER ──
  if (layoutType === 'chapter') {
    return (
      <div
        className={isScreen ? `${themeClasses.bg} ${themeClasses.text} ${fontClass} relative shadow-xl overflow-hidden flex flex-col print-sheet` : 'print-sheet'}
        style={{
          width: pageWidth, height: pageHeight,
          paddingTop: `${pTopPx}${unit}`, paddingBottom: `${pBottomPx}${unit}`,
          paddingLeft: `${paddingLeft}${unit}`, paddingRight: `${paddingRight}${unit}`,
          ...(isScreen ? {} : { fontFamily, fontSize: `${settings.fontSize}pt`, lineHeight: settings.lineHeight, boxSizing: 'border-box', position: 'relative', ...printColorAdjust, display: 'flex', flexDirection: 'column', backgroundColor: printBg, color: printFg, overflow: 'hidden' }),
        }}
      >
        {cropMarks}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: uF(4) }}>
          <span style={{ fontFamily: 'monospace', letterSpacing: '0.32em', textTransform: 'uppercase', opacity: 0.28, fontSize: uF(0.8), display: 'block', marginBottom: uF(1.8) }}>PART</span>
          <h2 style={{ fontFamily: 'serif', fontWeight: 700, fontSize: uF(2.7), letterSpacing: '-0.01em', lineHeight: 1.05, textAlign: 'center', margin: `0 0 ${uF(1.4)}` }}>
            {page.title || ''}
          </h2>
          {page.content ? (
            <p style={{ fontFamily: 'serif', fontStyle: 'italic', textAlign: 'center', opacity: 0.55, lineHeight: 1.5, fontSize: uF(1.05), margin: 0 }}>
              {page.content}
            </p>
          ) : null}
        </div>
        {settings.showPageNumbers && (
          <div style={{ position: 'absolute', bottom: `${uN(settings.margins.bottom / 2.5)}${unit}`, left: `${paddingLeft}${unit}`, width: contentWidthStr, display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: isScreen ? '11px' : '7.5pt', color: isScreen ? undefined : 'rgba(0,0,0,0.6)' }}>
            {!isRightPage
              ? <><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span><span style={{ opacity: 0 }}>.</span></>
              : <><span style={{ opacity: 0 }}>.</span><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span></>}
          </div>
        )}
      </div>
    );
  }

  // ── SEQUENCE ──
  if (layoutType === 'sequence') {
    const seqLines = page.content.split('\n').filter(Boolean);
    const seqEntries = seqLines.map((line) => {
      const idx = line.lastIndexOf(' ');
      return idx === -1 ? { left: line, right: '' } : { left: line.slice(0, idx), right: line.slice(idx + 1) };
    });

    return (
      <div
        className={isScreen ? `${themeClasses.bg} ${themeClasses.text} ${fontClass} relative shadow-xl overflow-hidden flex flex-col justify-between select-text print-sheet` : 'print-sheet'}
        style={{
          width: pageWidth, height: pageHeight,
          paddingTop: `${pTopPx}${unit}`, paddingBottom: `${pBottomPx}${unit}`,
          paddingLeft: `${paddingLeft}${unit}`, paddingRight: `${paddingRight}${unit}`,
          fontSize: uF(1), lineHeight: settings.lineHeight,
          ...(isScreen ? {} : { fontFamily, boxSizing: 'border-box', position: 'relative', ...printColorAdjust, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: printBg, color: printFg, overflow: 'hidden' }),
        }}
      >
        {cropMarks}
        {/* Section header */}
        {page.title && settings.showRunningHead && (
          <div style={{
            position: 'absolute',
            top: `${uN(settings.margins.top / 2.5)}${unit}`,
            left: `${paddingLeft}${unit}`,
            width: contentWidthStr,
            borderBottom: isScreen ? '1px solid rgba(0,0,0,0.12)' : '0.2mm solid rgba(0,0,0,0.15)',
            paddingBottom: isScreen ? `${uN(0.4)}px` : '1mm',
            fontFamily: 'monospace',
            fontSize: isScreen ? `${fontPx * 0.75}px` : `${settings.fontSize * 0.75}pt`,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            opacity: 0.45,
          }}>
            {page.title}
          </div>
        )}
        {/* Item list */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {seqEntries.map((entry, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              paddingTop: uF(0.25), paddingBottom: uF(0.25),
              borderBottom: isScreen ? '1px solid rgba(0,0,0,0.07)' : '0.2mm solid rgba(0,0,0,0.07)',
            }}>
              <span>{entry.left}</span>
              <span style={{ fontFamily: 'monospace', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: uF(0.78), opacity: 0.5, marginLeft: uF(1) }}>
                {entry.right}
              </span>
            </div>
          ))}
        </div>
        {settings.showPageNumbers && (
          <div style={{ position: 'absolute', bottom: `${uN(settings.margins.bottom / 2.5)}${unit}`, left: `${paddingLeft}${unit}`, width: contentWidthStr, display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: isScreen ? '11px' : '7.5pt', color: isScreen ? undefined : 'rgba(0,0,0,0.6)' }}>
            {!isRightPage
              ? <><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span><span style={{ opacity: 0 }}>.</span></>
              : <><span style={{ opacity: 0 }}>.</span><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span></>}
          </div>
        )}
      </div>
    );
  }

  // ── TITLE-BODY ──
  if (layoutType === 'title-body') {
    return (
      <div
        id={isScreen ? `preview-page-${pageNum}` : undefined}
        className={isScreen ? `${themeClasses.bg} ${themeClasses.text} ${fontClass} relative shadow-xl overflow-hidden flex flex-col justify-between select-text print-sheet` : 'print-sheet'}
        style={{
          width: pageWidth, height: pageHeight,
          paddingTop: `${pTopPx}${unit}`, paddingBottom: `${pBottomPx}${unit}`,
          paddingLeft: `${paddingLeft}${unit}`, paddingRight: `${paddingRight}${unit}`,
          fontSize: uF(1), lineHeight: settings.lineHeight,
          ...(isScreen ? {} : { fontFamily, boxSizing: 'border-box', position: 'relative', ...printColorAdjust, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: printBg, color: printFg, overflow: 'hidden' }),
        }}
      >
        {cropMarks}
        {settings.showRunningHead && page.title && (
          <div style={{
            position: 'absolute',
            top: `${uN(settings.margins.top / 2.5)}${unit}`,
            left: `${paddingLeft}${unit}`,
            width: contentWidthStr,
            borderBottom: isScreen ? '1px solid rgba(0,0,0,0.1)' : '0.2mm solid rgba(0,0,0,0.12)',
            paddingBottom: isScreen ? '6px' : '1mm',
            fontFamily: 'monospace',
            fontSize: isScreen ? '11px' : '7.5pt',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            opacity: 0.5,
          }}>
            <span className="truncate">{page.title}</span>
          </div>
        )}
        <div style={{ height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
          <div style={{ fontSize: uF(1), lineHeight: settings.lineHeight, overflow: 'hidden', height: '100%' }}>
            {page.content.length > 0 && (
              <span style={{ float: 'left', fontSize: uF(3.4), lineHeight: 0.82, marginRight: uF(0.08), marginTop: uF(0.06), fontWeight: 700, fontFamily: 'inherit' }}>
                {page.content[0]}
              </span>
            )}
            <span className="whitespace-pre-wrap break-words">{page.content.length > 0 ? page.content.slice(1) : ''}</span>
          </div>
        </div>
        {settings.showPageNumbers && (
          <div style={{ position: 'absolute', bottom: `${uN(settings.margins.bottom / 2.5)}${unit}`, left: `${paddingLeft}${unit}`, width: contentWidthStr, display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: isScreen ? '11px' : '7.5pt', color: isScreen ? undefined : 'rgba(0,0,0,0.6)' }}>
            {!isRightPage
              ? <><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span><span style={{ opacity: 0 }}>.</span></>
              : <><span style={{ opacity: 0 }}>.</span><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span></>}
          </div>
        )}
      </div>
    );
  }

  // ── BLANK ──
  if (layoutType === 'blank') {
    return (
      <div
        className={isScreen ? `${themeClasses.bg} ${themeClasses.text} relative shadow-xl overflow-hidden print-sheet` : 'print-sheet'}
        style={{ width: pageWidth, height: pageHeight, ...(isScreen ? {} : { backgroundColor: printBg, overflow: 'hidden', position: 'relative', boxSizing: 'border-box', ...printColorAdjust }) }}
      >
        {cropMarks}
      </div>
    );
  }

  // ── TITLE ──
  if (layoutType === 'title') {
    return (
      <div
        className={isScreen ? `${themeClasses.bg} ${themeClasses.text} ${fontClass} relative shadow-xl overflow-hidden flex items-center justify-center print-sheet` : 'print-sheet'}
        style={{
          width: pageWidth, height: pageHeight,
          paddingLeft: `${paddingLeft}${unit}`, paddingRight: `${paddingRight}${unit}`,
          ...(isScreen ? {} : { fontFamily, boxSizing: 'border-box', position: 'relative', ...printColorAdjust, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: printBg, color: printFg, overflow: 'hidden' }),
        }}
      >
        {cropMarks}
        <div className="text-center whitespace-pre-wrap break-words w-full" style={{ fontSize: uF(1.8), lineHeight: 1.4, fontWeight: 700 }}>
          {page.content}
        </div>
      </div>
    );
  }

  // ── POEM ──
  if (layoutType === 'poem') {
    const poemExtraH = isScreen ? pInnerPx * 0.6 : pInnerPx * 0.6;
    const poemPaddingLeft  = paddingLeft  + poemExtraH;
    const poemPaddingRight = paddingRight + poemExtraH;
    const poemLineHeight   = settings.lineHeight * 1.4;
    const poemContentW = isScreen
      ? (paperSize.width * scale) - poemPaddingLeft - poemPaddingRight
      : paperSize.width - poemPaddingLeft - poemPaddingRight;

    return (
      <div
        className={isScreen ? `${themeClasses.bg} ${themeClasses.text} ${fontClass} relative shadow-xl overflow-hidden flex flex-col justify-between select-text print-sheet` : 'print-sheet'}
        style={{
          width: pageWidth, height: pageHeight,
          paddingTop: `${pTopPx}${unit}`, paddingBottom: `${pBottomPx}${unit}`,
          paddingLeft: `${poemPaddingLeft}${unit}`, paddingRight: `${poemPaddingRight}${unit}`,
          fontSize: uF(1), lineHeight: poemLineHeight,
          ...(isScreen ? {} : { fontFamily, boxSizing: 'border-box', position: 'relative', ...printColorAdjust, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: printBg, color: printFg, overflow: 'hidden' }),
        }}
      >
        {cropMarks}
        {settings.showRunningHead && (
          <div style={{
            position: 'absolute',
            top: `${uN(settings.margins.top / 2.5)}${unit}`,
            left: `${poemPaddingLeft}${unit}`,
            width: `${poemContentW}${unit}`,
            borderBottom: isScreen ? '1px solid rgba(0,0,0,0.1)' : '0.2mm solid rgba(0,0,0,0.12)',
            paddingBottom: isScreen ? '6px' : '1mm',
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'monospace', fontSize: isScreen ? '11px' : '7.5pt',
            letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5,
          }}>
            <span className="truncate">{book.title}</span>
            <span style={{ fontWeight: 300 }}>{book.author}</span>
          </div>
        )}
        <div style={{ height: '100%', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <div className="w-full whitespace-pre-wrap break-words overflow-hidden" style={{ fontSize: uF(1), lineHeight: poemLineHeight }}>
            {page.content}
          </div>
        </div>
        {settings.showPageNumbers && (
          <div style={{ position: 'absolute', bottom: `${uN(settings.margins.bottom / 2.5)}${unit}`, left: `${poemPaddingLeft}${unit}`, width: `${poemContentW}${unit}`, display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: isScreen ? '11px' : '7.5pt', color: isScreen ? undefined : 'rgba(0,0,0,0.6)' }}>
            {!isRightPage
              ? <><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span><span style={{ opacity: 0 }}>.</span></>
              : <><span style={{ opacity: 0 }}>.</span><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span></>}
          </div>
        )}
      </div>
    );
  }

  // ── QUOTE ──
  if (layoutType === 'quote') {
    return (
      <div
        className={isScreen ? `${themeClasses.bg} ${themeClasses.text} ${fontClass} relative shadow-xl overflow-hidden flex items-center justify-center print-sheet` : 'print-sheet'}
        style={{
          width: pageWidth, height: pageHeight,
          paddingTop: `${pTopPx}${unit}`, paddingBottom: `${pBottomPx}${unit}`,
          paddingLeft: `${paddingLeft}${unit}`, paddingRight: `${paddingRight}${unit}`,
          ...(isScreen ? {} : { fontFamily, boxSizing: 'border-box', position: 'relative', ...printColorAdjust, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: printBg, color: printFg, overflow: 'hidden' }),
        }}
      >
        {cropMarks}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', textAlign: 'center' }}>
          <div className="whitespace-pre-wrap break-words italic" style={{ fontSize: uF(1.65), lineHeight: settings.lineHeight * 1.15 }}>
            {page.content}
          </div>
        </div>
        {settings.showPageNumbers && (
          <div style={{ position: 'absolute', bottom: `${uN(settings.margins.bottom / 2.5)}${unit}`, left: `${paddingLeft}${unit}`, width: contentWidthStr, display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: isScreen ? '11px' : '7.5pt', color: isScreen ? undefined : 'rgba(0,0,0,0.6)' }}>
            {!isRightPage
              ? <><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span><span style={{ opacity: 0 }}>.</span></>
              : <><span style={{ opacity: 0 }}>.</span><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span></>}
          </div>
        )}
      </div>
    );
  }

  // ── BODY / default ──
  return (
    <div
      id={isScreen ? `preview-page-${pageNum}` : undefined}
      className={isScreen ? `${themeClasses.bg} ${themeClasses.text} ${fontClass} relative shadow-xl overflow-hidden flex flex-col justify-between select-text print-sheet` : 'print-sheet'}
      style={{
        width: pageWidth, height: pageHeight,
        paddingTop: `${pTopPx}${unit}`, paddingBottom: `${pBottomPx}${unit}`,
        paddingLeft: `${paddingLeft}${unit}`, paddingRight: `${paddingRight}${unit}`,
        fontSize: uF(1), lineHeight: settings.lineHeight,
        ...(isScreen ? {} : { fontFamily, boxSizing: 'border-box', position: 'relative', ...printColorAdjust, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: printBg, color: printFg, overflow: 'hidden' }),
      }}
    >
      {cropMarks}
      {settings.showRunningHead && (
        <div style={{
          position: 'absolute',
          top: `${uN(settings.margins.top / 2.5)}${unit}`,
          left: `${paddingLeft}${unit}`,
          width: contentWidthStr,
          borderBottom: isScreen ? '1px solid rgba(0,0,0,0.1)' : '0.2mm solid rgba(0,0,0,0.12)',
          paddingBottom: isScreen ? '6px' : '1mm',
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'monospace', fontSize: isScreen ? '11px' : '7.5pt',
          letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5,
        }}>
          {!isRightPage ? (
            <><span className="truncate">{book.title}</span><span style={{ fontWeight: 300 }}>{book.author}</span></>
          ) : (
            <><span style={{ fontWeight: 300 }}>{book.author}</span><span className="truncate">{book.title}</span></>
          )}
        </div>
      )}
      <div style={{ height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
        <div style={{ fontSize: uF(1), lineHeight: settings.lineHeight, overflow: 'hidden', height: '100%' }}>
          {page.content.length > 0 && (
            <span style={{ float: 'left', fontSize: uF(3.4), lineHeight: 0.82, marginRight: uF(0.08), marginTop: uF(0.06), fontWeight: 700, fontFamily: 'inherit' }}>
              {page.content[0]}
            </span>
          )}
          <span className="whitespace-pre-wrap break-words">{page.content.length > 0 ? page.content.slice(1) : ''}</span>
        </div>
      </div>
      {settings.showPageNumbers && (
        <div style={{ position: 'absolute', bottom: `${uN(settings.margins.bottom / 2.5)}${unit}`, left: `${paddingLeft}${unit}`, width: contentWidthStr, display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: isScreen ? '11px' : '7.5pt', color: isScreen ? undefined : 'rgba(0,0,0,0.6)' }}>
          {!isRightPage
            ? <><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span><span style={{ opacity: 0 }}>.</span></>
            : <><span style={{ opacity: 0 }}>.</span><span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>{pageNum}</span></>}
        </div>
      )}
    </div>
  );
}
