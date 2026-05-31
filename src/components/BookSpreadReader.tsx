/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Book, Page, PageLayoutType, PrintSettings, PRESET_PAPER_SIZES, TocEntry } from '../types';

export type PaperTheme = 'creamy' | 'white' | 'sepia' | 'dark';

interface BookSpreadReaderProps {
  book: Book;
  settings: PrintSettings;
  scale: number;
  onUpdatePageText: (pageId: string, text: string) => void;
  isEditMode: boolean;
  viewMode: 'single' | 'double';
  currentPageSpread: number;
  paperTheme: PaperTheme;
}

export default function BookSpreadReader({
  book,
  settings,
  scale,
  onUpdatePageText,
  isEditMode,
  viewMode,
  currentPageSpread,
  paperTheme,
}: BookSpreadReaderProps) {

  const paperSize = PRESET_PAPER_SIZES.find((p) => p.id === settings.paperSizeId) || PRESET_PAPER_SIZES[0];
  const pages = book.pages;
  const totalPages = pages.length;

  const ptToMm = 0.35277;
  const fontPx = settings.fontSize * ptToMm * scale;

  const themeClasses = {
    creamy: { bg: 'bg-[#FAF6EC]', text: 'text-[#2C261F]', deskBg: '#ECE5D8' },
    white:  { bg: 'bg-[#FFFFFF]', text: 'text-slate-800',  deskBg: '#f1f5f9' },
    sepia:  { bg: 'bg-[#EBDCB9]', text: 'text-[#432A15]',  deskBg: '#DAC292' },
    dark:   { bg: 'bg-[#2E2E2E]', text: 'text-[#ECECE2]',  deskBg: '#1C1C1C' },
  }[paperTheme];

  const fontClass = {
    'Noto Serif KR':    'font-serif',
    'Inter':            'font-sans',
    'Fira Code':        'font-mono',
    'Playfair Display': 'font-serif',
  }[settings.fontFamily] || 'font-serif';

  // ─── LAYOUT-AWARE PAGE RENDERER ───
  const renderPage = (pageIndex: number, isRightPage: boolean) => {
    const pageWidth  = `${paperSize.width  * scale}px`;
    const pageHeight = `${paperSize.height * scale}px`;

    // Blank slot (beyond last page in double view)
    if (pageIndex < 0 || pageIndex >= totalPages) {
      return (
        <div
          style={{ width: pageWidth, height: pageHeight }}
          className={`${themeClasses.bg} relative hidden md:flex items-center justify-center`}
        >
          <span className="text-slate-400/40 text-xs font-mono select-none">[빈 페이지]</span>
        </div>
      );
    }

    const page = pages[pageIndex];
    const layoutType: PageLayoutType = page.layoutType;

    // Margin calculations
    const pTopPx    = settings.margins.top    * scale;
    const pBottomPx = settings.margins.bottom * scale;
    const pInnerPx  = settings.margins.inner  * scale;
    const pOuterPx  = settings.margins.outer  * scale;
    const paddingLeft  = isRightPage ? pInnerPx : pOuterPx;
    const paddingRight = isRightPage ? pOuterPx : pInnerPx;
    const pageNum = pageIndex + 1;

    // ── COVER layout ──
    if (layoutType === 'cover') {
      const coverTheme = ({
        classic:  { bg: '#2C261F', fg: '#FAF6EC', accent: '#9A8272' },
        modern:   { bg: '#111111', fg: '#ffffff',  accent: '#888888' },
        academic: { bg: '#1E3A5F', fg: '#ffffff',  accent: '#6b9bd2' },
        zen:      { bg: '#f9f9f7', fg: '#333333',  accent: '#999999' },
      } as Record<string, { bg: string; fg: string; accent: string }>)[book.theme]
        || { bg: '#2C261F', fg: '#FAF6EC', accent: '#9A8272' };

      return (
        <div
          style={{ width: pageWidth, height: pageHeight, backgroundColor: coverTheme.bg, color: coverTheme.fg }}
          className="relative shadow-xl overflow-hidden flex flex-col items-center justify-center text-center"
        >
          <div className="w-full h-full flex flex-col justify-between items-center py-[12%] px-[12%]">
            <div className="flex flex-col items-center gap-2">
              <span
                className="tracking-[0.18em] font-sans uppercase opacity-70 block"
                style={{ fontSize: `${fontPx * 0.85}px` }}
              >
                {book.subtitle || ''}
              </span>
              <div style={{ width: `${30 * scale}px`, height: 1, backgroundColor: coverTheme.accent, opacity: 0.4, marginTop: `${2 * scale}px` }} />
              <h1
                className="font-serif font-black leading-tight tracking-tight px-2"
                style={{ fontSize: `${fontPx * 2.4}px`, marginTop: `${4 * scale}px` }}
              >
                {book.title}
              </h1>
              <div style={{ width: `${35 * scale}px`, height: 1, backgroundColor: coverTheme.fg, opacity: 0.25, margin: `${3 * scale}px 0` }} />
              <p
                className="font-serif font-medium"
                style={{ fontSize: `${fontPx * 1.2}px`, marginTop: `${2 * scale}px`, opacity: 0.85 }}
              >
                {book.author}
              </p>
            </div>
            <span className="font-mono tracking-widest opacity-60" style={{ fontSize: `${fontPx * 0.75}px` }}>
              {book.publisher || ''}
            </span>
          </div>
        </div>
      );
    }

    // ── TOC layout ──
    if (layoutType === 'toc') {
      let entries: TocEntry[] = [];
      try { entries = JSON.parse(page.content); } catch { entries = []; }

      return (
        <div
          style={{
            width: pageWidth,
            height: pageHeight,
            paddingTop:    `${pTopPx}px`,
            paddingBottom: `${pBottomPx}px`,
            paddingLeft:   `${paddingLeft}px`,
            paddingRight:  `${paddingRight}px`,
          }}
          className={`${themeClasses.bg} ${themeClasses.text} ${fontClass} relative shadow-xl overflow-hidden flex flex-col justify-between`}
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center" style={{ marginBottom: `${fontPx * 1.8}px` }}>
            <span
              className="font-mono tracking-[0.3em] uppercase opacity-40 block"
              style={{ fontSize: `${fontPx * 0.8}px` }}
            >
              INDEX
            </span>
            <h2
              className="font-serif font-bold leading-tight"
              style={{ fontSize: `${fontPx * 2.2}px`, margin: `${fontPx * 0.5}px 0 ${fontPx * 0.6}px` }}
            >
              {page.title || '목차'}
            </h2>
            <div style={{ width: `${20 * scale}px`, height: 1, backgroundColor: 'currentColor', opacity: 0.2 }} />
          </div>

          {/* Entry list */}
          <div className="flex-1 overflow-hidden" style={{ display: 'flex', flexDirection: 'column', gap: `${fontPx * 1.4}px` }}>
            {entries.map((entry, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between" style={{ marginBottom: `${fontPx * 0.15}px` }}>
                  <span
                    className="font-mono tracking-[0.2em] uppercase opacity-45"
                    style={{ fontSize: `${fontPx * 0.78}px` }}
                  >
                    {entry.chapter}
                  </span>
                  <span
                    className="font-mono opacity-45"
                    style={{ fontSize: `${fontPx * 0.78}px` }}
                  >
                    P.{entry.pageNum}
                  </span>
                </div>
                <div style={{ height: 1, backgroundColor: 'currentColor', opacity: 0.08, marginBottom: `${fontPx * 0.3}px` }} />
                <p
                  className="font-serif"
                  style={{ fontSize: `${fontPx * 1.05}px`, lineHeight: 1.4 }}
                >
                  {entry.title}
                </p>
              </div>
            ))}
          </div>

          {/* Page number */}
          {settings.showPageNumbers && (
            <div
              style={{
                bottom: `${(settings.margins.bottom / 2.5) * scale}px`,
                left:   `${paddingLeft}px`,
                width:  `${(paperSize.width - settings.margins.inner - settings.margins.outer) * scale}px`,
              }}
              className="absolute flex justify-between text-[11px] font-mono leading-none text-current/60 select-none"
            >
              {!isRightPage
                ? <><span className="font-bold text-[#B5714A]/80">{pageNum}</span><span className="opacity-0">.</span></>
                : <><span className="opacity-0">.</span><span className="font-bold text-[#B5714A]/80">{pageNum}</span></>
              }
            </div>
          )}
        </div>
      );
    }

    // ── BLANK layout ──
    if (layoutType === 'blank') {
      return (
        <div
          style={{ width: pageWidth, height: pageHeight }}
          className={`${themeClasses.bg} ${themeClasses.text} relative shadow-xl overflow-hidden`}
        >
          {isEditMode && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400/30 text-xs font-mono select-none pointer-events-none">
              빈 페이지
            </div>
          )}
        </div>
      );
    }

    // ── TITLE layout ──
    if (layoutType === 'title') {
      return (
        <div
          style={{ width: pageWidth, height: pageHeight, paddingLeft, paddingRight }}
          className={`${themeClasses.bg} ${themeClasses.text} ${fontClass} relative shadow-xl overflow-hidden flex items-center justify-center`}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-overlay bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />
          {isEditMode ? (
            <textarea
              value={page.content}
              onChange={(e) => onUpdatePageText(page.id, e.target.value)}
              placeholder="제목 텍스트 입력..."
              className="w-full resize-none bg-transparent outline-none border-none p-0 focus:ring-0 text-center overflow-hidden"
              style={{
                fontSize: `${fontPx * 1.8}px`,
                lineHeight: 1.4,
                fontWeight: 700,
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <div
              className="text-center whitespace-pre-wrap break-words w-full"
              style={{ fontSize: `${fontPx * 1.8}px`, lineHeight: 1.4, fontWeight: 700 }}
            >
              {page.content}
            </div>
          )}
        </div>
      );
    }

    // ── POEM layout ──
    if (layoutType === 'poem') {
      const poemExtraH = pInnerPx * 0.6;
      const poemPaddingLeft  = paddingLeft  + poemExtraH;
      const poemPaddingRight = paddingRight + poemExtraH;
      const poemLineHeight   = settings.lineHeight * 1.4;

      return (
        <div
          style={{
            width: pageWidth,
            height: pageHeight,
            paddingTop:    `${pTopPx}px`,
            paddingBottom: `${pBottomPx}px`,
            paddingLeft:   `${poemPaddingLeft}px`,
            paddingRight:  `${poemPaddingRight}px`,
            fontSize:      `${fontPx}px`,
            lineHeight:    poemLineHeight,
          }}
          className={`${themeClasses.bg} ${themeClasses.text} ${fontClass} relative shadow-xl overflow-hidden flex flex-col justify-between select-text`}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-overlay bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Running Head */}
          {settings.showRunningHead && (
            <div
              style={{ top: `${(settings.margins.top / 2.5) * scale}px`, left: `${poemPaddingLeft}px`, width: `${(paperSize.width * scale) - poemPaddingLeft - poemPaddingRight}px` }}
              className="absolute border-b border-current/10 pb-1.5 flex justify-between text-[11px] font-mono tracking-widest leading-none text-current/50 select-none uppercase"
            >
              <span className="truncate max-w-[150px]">{book.title}</span>
              <span className="font-light">{book.author}</span>
            </div>
          )}

          {/* Poem Body */}
          <div className="h-full w-full overflow-hidden relative flex items-center">
            {isEditMode ? (
              <textarea
                value={page.content}
                onChange={(e) => onUpdatePageText(page.id, e.target.value)}
                className="w-full h-full resize-none bg-transparent outline-none border-none p-0 focus:ring-0 text-current overflow-hidden"
                style={{ fontSize: `${fontPx}px`, lineHeight: poemLineHeight, fontFamily: 'inherit' }}
                placeholder="시 내용 입력..."
              />
            ) : (
              <div className="w-full whitespace-pre-wrap break-words overflow-hidden"
                style={{ fontSize: `${fontPx}px`, lineHeight: poemLineHeight }}
              >
                {page.content}
              </div>
            )}
          </div>

          {/* Page Number */}
          {settings.showPageNumbers && (
            <div
              style={{ bottom: `${(settings.margins.bottom / 2.5) * scale}px`, left: `${poemPaddingLeft}px`, width: `${(paperSize.width * scale) - poemPaddingLeft - poemPaddingRight}px` }}
              className="absolute flex justify-between text-[11px] font-mono leading-none text-current/60 select-none"
            >
              {!isRightPage
                ? <><span className="font-bold text-[#B5714A]/80">{pageNum}</span><span className="opacity-0">.</span></>
                : <><span className="opacity-0">.</span><span className="font-bold text-[#B5714A]/80">{pageNum}</span></>
              }
            </div>
          )}
        </div>
      );
    }

    // ── QUOTE layout ──
    if (layoutType === 'quote') {
      return (
        <div
          style={{ width: pageWidth, height: pageHeight, paddingLeft, paddingRight }}
          className={`${themeClasses.bg} ${themeClasses.text} ${fontClass} relative shadow-xl overflow-hidden flex items-center justify-center`}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-overlay bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Decorative quote mark */}
          <div
            className="absolute top-[15%] left-0 right-0 text-center pointer-events-none select-none text-current/10 font-serif leading-none"
            style={{ fontSize: `${fontPx * 8}px` }}
            aria-hidden
          >
            "
          </div>

          <div className="relative z-10 w-full text-center">
            {isEditMode ? (
              <textarea
                value={page.content}
                onChange={(e) => onUpdatePageText(page.id, e.target.value)}
                placeholder="인용구 텍스트 입력..."
                className="w-full resize-none bg-transparent outline-none border-none p-0 focus:ring-0 text-center overflow-hidden italic"
                style={{
                  fontSize: `${fontPx * 1.3}px`,
                  lineHeight: settings.lineHeight * 1.2,
                  fontFamily: 'inherit',
                }}
              />
            ) : (
              <div
                className="whitespace-pre-wrap break-words italic"
                style={{ fontSize: `${fontPx * 1.3}px`, lineHeight: settings.lineHeight * 1.2 }}
              >
                {page.content}
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── BODY layout (default) ──
    return (
      <div
        id={`preview-page-${pageNum}`}
        style={{
          width:         pageWidth,
          height:        pageHeight,
          paddingTop:    `${pTopPx}px`,
          paddingBottom: `${pBottomPx}px`,
          paddingLeft:   `${paddingLeft}px`,
          paddingRight:  `${paddingRight}px`,
          fontSize:      `${fontPx}px`,
          lineHeight:    settings.lineHeight,
        }}
        className={`${themeClasses.bg} ${themeClasses.text} ${fontClass} relative shadow-xl overflow-hidden flex flex-col justify-between select-text`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-overlay bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* Running Head */}
        {settings.showRunningHead && (
          <div
            style={{
              top:   `${(settings.margins.top / 2.5) * scale}px`,
              left:  `${paddingLeft}px`,
              width: `${(paperSize.width - settings.margins.inner - settings.margins.outer) * scale}px`,
            }}
            className="absolute border-b border-current/10 pb-1.5 flex justify-between text-[11px] font-mono tracking-widest leading-none text-current/50 select-none uppercase"
          >
            {!isRightPage ? (
              <>
                <span className="truncate max-w-[150px]">{book.title}</span>
                <span className="font-light">{book.author}</span>
              </>
            ) : (
              <>
                <span className="font-light">{book.author}</span>
                <span className="truncate max-w-[150px]">{book.title}</span>
              </>
            )}
          </div>
        )}

        {/* Body Text */}
        <div className="h-full w-full overflow-hidden relative">
          {isEditMode ? (
            <textarea
              value={page.content}
              onChange={(e) => onUpdatePageText(page.id, e.target.value)}
              className="w-full h-full resize-none bg-transparent outline-none border-none p-0 focus:ring-0 text-current overflow-hidden"
              style={{ fontSize: `${fontPx}px`, lineHeight: settings.lineHeight, fontFamily: 'inherit' }}
              placeholder="내용을 채워 넣어보세요..."
            />
          ) : (
            <div
              className="w-full h-full whitespace-pre-wrap break-words overflow-hidden"
              style={{ fontSize: `${fontPx}px`, lineHeight: settings.lineHeight }}
            >
              {page.content}
            </div>
          )}
        </div>

        {/* Page Number */}
        {settings.showPageNumbers && (
          <div
            style={{
              bottom: `${(settings.margins.bottom / 2.5) * scale}px`,
              left:   `${paddingLeft}px`,
              width:  `${(paperSize.width - settings.margins.inner - settings.margins.outer) * scale}px`,
            }}
            className="absolute flex justify-between text-[11px] font-mono leading-none text-current/60 select-none"
          >
            {!isRightPage
              ? <><span className="font-bold text-[#B5714A]/80">{pageNum}</span><span className="opacity-0">.</span></>
              : <><span className="opacity-0">.</span><span className="font-bold text-[#B5714A]/80">{pageNum}</span></>
            }
          </div>
        )}

        {isEditMode && page.content.length > 550 && (
          <div className="absolute right-2 bottom-2 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 text-[8px] font-sans text-amber-700/80 pointer-events-none select-none">
            본문 분량 많음
          </div>
        )}
      </div>
    );
  };

  const leftPageIndex  = currentPageSpread;
  const rightPageIndex = currentPageSpread + 1;

  return (
    <div className="w-full flex justify-center items-start overflow-auto py-10 px-6 min-h-full transition-colors duration-200 scrollbar-thin"
      style={{ backgroundColor: themeClasses.deskBg }}
    >
      {viewMode === 'double' ? (
        <div className="relative flex justify-center drop-shadow-2xl">
          <div className="absolute inset-0 bg-[#3a4454]/10 rounded-2xl -m-2 opacity-50 blur-xl pointer-events-none" />
          {renderPage(leftPageIndex, false)}
          {/* Spine */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-30 flex">
            <div className="w-1/2 h-full bg-gradient-to-r from-black/8 via-black/18 to-transparent" />
            <div className="w-1/2 h-full bg-gradient-to-l from-black/8 via-black/18 to-transparent" />
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-black/40 shadow-[0_0_2px_rgba(0,0,0,0.5)]" />
          </div>
          {renderPage(rightPageIndex, true)}
        </div>
      ) : (
        <div className="relative shadow-2xl rounded-sm">
          {renderPage(currentPageSpread, currentPageSpread % 2 !== 0)}
        </div>
      )}
    </div>
  );
}
