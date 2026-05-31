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
  viewMode: 'single' | 'double';
  currentPageSpread: number;
  paperTheme: PaperTheme;
}

export default function BookSpreadReader({
  book,
  settings,
  scale,
  viewMode,
  currentPageSpread,
  paperTheme,
}: BookSpreadReaderProps) {

  const paperSize = PRESET_PAPER_SIZES.find((p) => p.id === settings.paperSizeId) || PRESET_PAPER_SIZES[0];
  const pages = book.pages;
  const totalPages = pages.length;

  const deskBg = {
    creamy: '#ECE5D8',
    white:  '#f1f5f9',
    sepia:  '#DAC292',
    dark:   '#1C1C1C',
  }[paperTheme];

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

    return (
      <PageRenderer
        key={pages[pageIndex].id}
        page={pages[pageIndex]}
        pageIndex={pageIndex}
        isRightPage={isRightPage}
        book={book}
        settings={settings}
        mode="screen"
        scale={scale}
        paperTheme={paperTheme}
      />
    );
  };

  const leftPageIndex  = currentPageSpread;
  const rightPageIndex = currentPageSpread + 1;

  return (
    <div className="w-full flex justify-center items-start overflow-auto py-10 px-6 min-h-full transition-colors duration-200 scrollbar-thin"
      style={{ backgroundColor: deskBg }}
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
