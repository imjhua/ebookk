/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Book, Page, PageLayoutType, PrintSettings, PRESET_PAPER_SIZES } from '../types';
import { ArrowLeft, ArrowRight, BookOpen, Layers, SunDim, Compass } from 'lucide-react';

interface BookSpreadReaderProps {
  book: Book;
  settings: PrintSettings;
  scale: number;
  onUpdatePageText: (pageId: string, text: string) => void;
  isEditMode: boolean;
}

export default function BookSpreadReader({
  book,
  settings,
  scale,
  onUpdatePageText,
  isEditMode,
}: BookSpreadReaderProps) {
  const [currentPageSpread, setCurrentPageSpread] = useState(0);
  const [paperTheme, setPaperTheme] = useState<'creamy' | 'white' | 'sepia' | 'dark'>('creamy');
  const [viewMode, setViewMode] = useState<'double' | 'single'>('double');

  const paperSize = PRESET_PAPER_SIZES.find((p) => p.id === settings.paperSizeId) || PRESET_PAPER_SIZES[0];
  const pages = book.pages;
  const totalPages = pages.length;

  const ptToMm = 0.35277;
  const fontPx = settings.fontSize * ptToMm * scale;

  const themeClasses = {
    creamy: { bg: 'bg-[#FAF6EC]', text: 'text-[#2C261F]', deskBg: 'bg-[#ECE5D8]' },
    white:  { bg: 'bg-[#FFFFFF]', text: 'text-slate-800',  deskBg: 'bg-slate-100' },
    sepia:  { bg: 'bg-[#EBDCB9]', text: 'text-[#432A15]',  deskBg: 'bg-[#DAC292]' },
    dark:   { bg: 'bg-[#2E2E2E]', text: 'text-[#ECECE2]',  deskBg: 'bg-[#1C1C1C]' },
  }[paperTheme];

  const fontClass = {
    'Noto Serif KR':    'font-serif',
    'Inter':            'font-sans',
    'Fira Code':        'font-mono',
    'Playfair Display': 'font-serif',
  }[settings.fontFamily] || 'font-serif';

  const handlePrev = () => {
    const step = viewMode === 'double' ? 2 : 1;
    setCurrentPageSpread(Math.max(0, currentPageSpread - step));
  };

  const handleNext = () => {
    const step = viewMode === 'double' ? 2 : 1;
    if (currentPageSpread + step < totalPages) {
      setCurrentPageSpread(currentPageSpread + step);
    }
  };

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
                ? <><span className="font-bold text-indigo-600/80">{pageNum}</span><span className="opacity-0">.</span></>
                : <><span className="opacity-0">.</span><span className="font-bold text-indigo-600/80">{pageNum}</span></>
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
              ? <><span className="font-bold text-indigo-600/80">{pageNum}</span><span className="opacity-0">.</span></>
              : <><span className="opacity-0">.</span><span className="font-bold text-indigo-600/80">{pageNum}</span></>
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

  const isAtStart = currentPageSpread === 0;
  const isAtEnd   = viewMode === 'double'
    ? currentPageSpread + 2 >= totalPages
    : currentPageSpread + 1 >= totalPages;

  return (
    <div className="flex flex-col gap-6 w-full items-center">

      {/* Controls Bar */}
      <div className="flex flex-wrap justify-between items-center w-full max-w-6xl bg-white border border-slate-100 rounded-2xl p-4 gap-4 shadow-sm relative z-10">
        <div className="flex items-center gap-2">
          <BookOpen className="text-indigo-600" size={18} />
          <span className="text-sm font-semibold text-slate-800">책장 시뮬레이터</span>
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <span className="text-xs text-slate-500 font-mono">
            {totalPages}p — {book.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
            <button
              onClick={() => { setViewMode('double'); setCurrentPageSpread(Math.floor(currentPageSpread / 2) * 2); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${viewMode === 'double' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Compass size={13} /> 양면 보기
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${viewMode === 'single' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Layers size={13} /> 단면 보기
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* Paper Theme */}
          <div className="flex items-center gap-1.5">
            <SunDim className="text-slate-400" size={14} />
            <div className="flex gap-1">
              {(['creamy', 'white', 'sepia', 'dark'] as const).map((theme) => {
                const colors = {
                  creamy: 'bg-[#FAF6EC] border-[#F2EADA]',
                  white:  'bg-white border-slate-200',
                  sepia:  'bg-[#EBDCB9] border-[#DECA9E]',
                  dark:   'bg-[#2E2E2E] border-[#242424]',
                }[theme];
                return (
                  <button
                    key={theme}
                    onClick={() => setPaperTheme(theme)}
                    className={`w-5 h-5 rounded-full border cursor-pointer transition-all ${colors} ${paperTheme === theme ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Book Desk */}
      <div className={`w-full overflow-auto py-10 px-6 rounded-3xl min-h-[500px] flex justify-center items-center ${themeClasses.deskBg} transition-colors duration-200 border border-[#000]/5 scrollbar-thin`}>
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

      {/* Navigation */}
      <div className="flex items-center justify-between w-full max-w-xl pb-2">
        <button
          onClick={handlePrev}
          disabled={isAtStart}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-white text-slate-700 hover:text-indigo-600 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} /> 이전 페이지
        </button>

        <span className="text-xs font-semibold font-mono text-slate-500 bg-slate-100 py-1.5 px-3.5 rounded-full select-none">
          {viewMode === 'double'
            ? `${currentPageSpread + 1}–${Math.min(totalPages, currentPageSpread + 2)}`
            : currentPageSpread + 1
          } / {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={isAtEnd}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-white text-slate-700 hover:text-indigo-600 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          다음 페이지 <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
