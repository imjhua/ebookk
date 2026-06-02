/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Book, PrintSettings, PRESET_PAPER_SIZES } from '../types';
import PageRenderer from './PageRenderer';
import type { PaperTheme } from './BookSpreadReader';

interface PrintSurfaceProps {
  book: Book;
  settings: PrintSettings;
  paperTheme?: PaperTheme;
}

export default function PrintSurface({ book, settings, paperTheme = 'white' }: PrintSurfaceProps) {
  const paperSize = PRESET_PAPER_SIZES.find((p) => p.id === settings.paperSizeId) || PRESET_PAPER_SIZES[0];

  // Dynamic print size CSS variables synchronization
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--print-paper-width', `${paperSize.width}mm`);
    root.style.setProperty('--print-paper-height', `${paperSize.height}mm`);
    
    return () => {
      root.style.removeProperty('--print-paper-width');
      root.style.removeProperty('--print-paper-height');
    };
  }, [paperSize.width, paperSize.height]);

  // ── Get the most recent chapter title up to a given page index ──
  // Running head should only show chapter titles, not page-level titles
  const getChapterTitleForPage = (pageIndex: number): string => {
    for (let i = pageIndex; i >= 0; i--) {
      const page = book.pages[i];
      // Only chapter layout titles are used for running head
      if (page.layoutType === 'chapter' && page.title) {
        return page.title;
      }
    }
    return '';
  };

  return (
    <div id="print-book-surface">
      {book.pages.map((page, index) => {
        const currentSectionTitle = getChapterTitleForPage(index);
        return (
          <React.Fragment key={page.id}>
          <PageRenderer
            page={page}
            pageIndex={index}
            isRightPage={index % 2 === 0}
            book={book}
            settings={settings}
            mode="print"
            paperTheme={paperTheme}
            currentSectionTitle={currentSectionTitle}
          />
          </React.Fragment>
        );
      })}
    </div>
  );
}
