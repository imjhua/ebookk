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

  return (
    <div id="print-book-surface">
      {book.pages.map((page, index) => (
        <React.Fragment key={page.id}>
        <PageRenderer
          page={page}
          pageIndex={index}
          isRightPage={index % 2 === 0}
          book={book}
          settings={settings}
          mode="print"
          paperTheme={paperTheme}
        />
        </React.Fragment>
      ))}
    </div>
  );
}
