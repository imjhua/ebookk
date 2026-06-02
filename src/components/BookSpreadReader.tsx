/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Book, PrintSettings, PRESET_PAPER_SIZES } from '../types';
import PageRenderer from './PageRenderer';

export type PaperTheme = 'creamy' | 'white' | 'sepia' | 'dark';

interface BookSpreadReaderProps {
  book: Book;
  settings: PrintSettings;
  scale: number;
  viewMode: 'single' | 'double' | 'all';
  currentPageSpread: number;
  paperTheme: PaperTheme;
  onPageClick?: (pageIndex: number) => void;
}

export default function BookSpreadReader({
  book,
  settings,
  scale,
  viewMode,
  currentPageSpread,
  paperTheme,
  onPageClick,
}: BookSpreadReaderProps) {

  // ── Safety check for uninitialized data ──
  if (!book || !book.pages || book.pages.length === 0) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: '#F5F0E8', color: '#9A8F86' }}
      >
        <div className="text-center">
          <div className="text-sm font-mono">데이터를 로드하는 중...</div>
        </div>
      </div>
    );
  }

  const paperSize = PRESET_PAPER_SIZES.find((p) => p.id === settings.paperSizeId) || PRESET_PAPER_SIZES[0];
  const pages = book.pages;
  const totalPages = pages.length;

  const deskBg = {
    creamy: '#ECE5D8',
    white:  '#f1f5f9',
    sepia:  '#DAC292',
    dark:   '#1C1C1C',
  }[paperTheme];

  // ── Get the most recent chapter title up to a given page index ──
  // Running head should only show chapter titles, not page-level titles
  const getChapterTitleForPage = (pageIndex: number): string => {
    for (let i = pageIndex; i >= 0; i--) {
      const page = pages[i];
      // Only chapter layout titles are used for running head
      if (page.layoutType === 'chapter' && page.title) {
        return page.title;
      }
    }
    return '';
  };

  // ─── PAGE RENDERER (delegates to shared PageRenderer component) ───
  const renderPage = (pageIndex: number, isRightPage: boolean) => {
    const pageWidth  = `${paperSize.width  * scale}px`;
    const pageHeight = `${paperSize.height * scale}px`;

    // Blank slot (beyond last page in double view)
    if (pageIndex < 0 || pageIndex >= totalPages) {
      const blankBg = { creamy: 'bg-[#FAF6EC]', white: 'bg-white', sepia: 'bg-[#EBDCB9]', dark: 'bg-[#2E2E2E]' }[paperTheme];
      return (
        <div
          style={{ width: pageWidth, height: pageHeight }}
          className={`${blankBg} relative hidden md:flex items-center justify-center`}
        >
          <span className="text-slate-400/40 text-xs font-mono select-none">[빈 페이지]</span>
        </div>
      );
    }

    const currentSectionTitle = getChapterTitleForPage(pageIndex);

    return (
      <PageRenderer
        page={pages[pageIndex]}
        pageIndex={pageIndex}
        isRightPage={isRightPage}
        book={book}
        settings={settings}
        mode="screen"
        scale={scale}
        paperTheme={paperTheme}
        currentSectionTitle={currentSectionTitle}
      />
    );
  };

  const leftPageIndex  = currentPageSpread;
  const rightPageIndex = currentPageSpread + 1;

  // ─── ALL PAGES GRID VIEW ───
  if (viewMode === 'all') {
    const thumbScale = Math.max(0.9, Math.min(1.5, 240 / paperSize.height));
    const thumbW = Math.round(paperSize.width  * thumbScale);
    const thumbH = Math.round(paperSize.height * thumbScale);

    return (
      <div
        className="w-full min-h-full p-8 transition-colors duration-200"
        style={{ backgroundColor: deskBg }}
      >
        <div
          className="grid gap-6 justify-center mx-auto"
          style={{ gridTemplateColumns: `repeat(auto-fill, ${thumbW}px)` }}
        >
          {pages.map((page, index) => {
            const isSelected = index === currentPageSpread || index === currentPageSpread + 1;
            const currentSectionTitle = getChapterTitleForPage(index);
            return (
              <div
                key={page.id}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
                onClick={() => onPageClick?.(index)}
              >
                <div
                  className="relative overflow-hidden transition-all duration-150 group-hover:scale-[1.03]"
                  style={{
                    width: thumbW,
                    height: thumbH,
                    boxShadow: isSelected
                      ? '0 0 0 2px #B5714A, 0 4px 16px rgba(0,0,0,0.25)'
                      : '0 2px 10px rgba(0,0,0,0.18)',
                    borderRadius: 2,
                  }}
                >
                  <PageRenderer
                    page={page}
                    pageIndex={index}
                    isRightPage={index % 2 !== 0}
                    book={book}
                    settings={settings}
                    mode="screen"
                    scale={thumbScale}
                    paperTheme={paperTheme}
                    currentSectionTitle={currentSectionTitle}
                  />
                </div>
                <span
                  className="text-[10px] font-mono select-none"
                  style={{ color: isSelected ? '#B5714A' : '#9A8F86' }}
                >
                  {index + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center items-start overflow-auto py-10 px-6 min-h-full transition-colors duration-200 scrollbar-thin"
      style={{ backgroundColor: deskBg }}
    >
      {viewMode === 'double' ? (
        <div className="relative flex justify-center drop-shadow-2xl">
          <div className="absolute inset-0 bg-[#3a4454]/10 rounded-2xl -m-2 opacity-50 blur-xl pointer-events-none" />
          {renderPage(leftPageIndex, false)}
          {rightPageIndex < totalPages && (
            <>
              {/* Spine */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-30 flex">
                <div className="w-1/2 h-full bg-gradient-to-r from-black/8 via-black/18 to-transparent" />
                <div className="w-1/2 h-full bg-gradient-to-l from-black/8 via-black/18 to-transparent" />
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-black/40 shadow-[0_0_2px_rgba(0,0,0,0.5)]" />
              </div>
              {renderPage(rightPageIndex, true)}
            </>
          )}
        </div>
      ) : (
        <div className="relative shadow-2xl rounded-sm">
          {renderPage(currentPageSpread, currentPageSpread % 2 !== 0)}
        </div>
      )}
    </div>
  );
}
