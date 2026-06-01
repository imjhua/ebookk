/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * PageRenderer — shared renderer used by both BookSpreadReader (screen) and
 * PrintSurface (print). Now refactored to delegate layout-specific content
 * to separate LayoutContent components.
 *
 * PageRenderer responsibilities:
 * - Page frame and dimensions
 * - Theme and styling
 * - Margins and padding
 * - Crop marks, page numbers, running heads
 * 
 * LayoutContent components responsibilities:
 * - Rendering only the content area
 * - Layout-specific styling and arrangement
 *
 * Screen mode:  pixel-based sizing driven by `scale` (px per mm).
 * Print mode:   mm/pt-based sizing via inline styles; no textarea / edit UI.
 */

import React from 'react';
import { Book, Page, PrintSettings, PRESET_PAPER_SIZES } from '../types';
import type { PaperTheme } from './BookSpreadReader';
import {
  makeUnits,
  CropMarksRenderer,
  PageNumberRenderer,
  RunningHeadRenderer,
  PAPER_THEME_MAP,
  FONT_CLASS_MAP,
  FONT_FAMILY_MAP,
  PRINT_COLOR_ADJUST_STYLE,
  LayoutContentProps,
} from './layout-helpers';
import { getLayoutContentComponent } from './layouts';

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
// Main component
// ─────────────────────────────────────────────
export default function PageRenderer(props: PageRendererProps) {
  const { page, pageIndex, isRightPage, book, settings } = props;

  // ── Safety check: handle undefined page or book ──
  if (!page || !book) {
    return (
      <div
        style={{
          width: '210mm',
          height: '297mm',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#999',
          fontSize: '14px',
        }}
      >
        Loading page...
      </div>
    );
  }

  // ── Ensure page has required properties ──
  const safePage: Page = {
    id: page.id || `page-${pageIndex}`,
    layoutType: page.layoutType || 'body',
    title: page.title || '',
    subtitle: page.subtitle || '',
    author: page.author || '',
    content: page.content || '',
    items: page.items,
    tocEntries: page.tocEntries,
  };

  const mode = props.mode;
  const isScreen = mode === 'screen';
  const scale = isScreen ? (props as ScreenProps).scale : 1;
  const paperTheme = isScreen
    ? (props as ScreenProps).paperTheme
    : ((props as PrintProps).paperTheme ?? 'white');

  const paperSize = PRESET_PAPER_SIZES.find((p) => p.id === settings.paperSizeId) || PRESET_PAPER_SIZES[0];
  const { fontPx, u, uF, uFn, uN, contentWidth, runningHeadTop } = makeUnits(mode, scale, settings, paperSize);

  const pageNum = pageIndex + 1;
  const layoutType = safePage.layoutType;

  // ── Paper theme ──
  const themeEntry = PAPER_THEME_MAP[paperTheme] || PAPER_THEME_MAP.white;
  const themeClasses = isScreen
    ? { bg: themeEntry.bg, text: themeEntry.text }
    : { bg: '', text: '' };
  const bgColorStyle = themeEntry.bgColor;
  const fgColorStyle = themeEntry.fgColor;
  const printColorAdjust = isScreen ? {} : PRINT_COLOR_ADJUST_STYLE;

  const fontClass = FONT_CLASS_MAP[settings.fontFamily] || 'font-serif';
  const fontFamily = FONT_FAMILY_MAP[settings.fontFamily] || 'Inter, sans-serif';

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

  // ── Shared helpers ──
  const contentWidthStr = `${contentWidth}${unit}`;

  // ── Get layout content component ──
  const LayoutContentComponent = getLayoutContentComponent(layoutType);

  // ── Build layout content props ──
  const contentProps: LayoutContentProps = {
    page: safePage,
    book,
    settings,
    isScreen,
    isRightPage,
    paperTheme,
    u,
    uF,
    uFn,
    uN,
    contentWidth: contentWidthStr,
    fontPx,
    fontFamily,
    unit,
  };

  // ── Page base styles ──
  const pageBaseStyle: React.CSSProperties = {
    width: pageWidth,
    height: pageHeight,
    paddingTop: `${pTopPx}${unit}`,
    paddingBottom: `${pBottomPx}${unit}`,
    paddingLeft: `${paddingLeft}${unit}`,
    paddingRight: `${paddingRight}${unit}`,
    backgroundColor: bgColorStyle,
    color: fgColorStyle,
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    fontSize: uF(1),
    lineHeight: settings.lineHeight,
    overflow: 'hidden',
  };

  if (!isScreen) {
    pageBaseStyle.fontFamily = fontFamily;
    pageBaseStyle.fontSize = `${settings.fontSize}pt`;
    Object.assign(pageBaseStyle, printColorAdjust);
  }

  // ── Determine page layout container structure ──
  // Some layouts are centered, some are between|space-between
  const containerLayoutStyle: React.CSSProperties =
    layoutType === 'cover'
      ? { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }
      : layoutType === 'quote'
      ? { display: 'flex', alignItems: 'center', justifyContent: 'center' }
      : layoutType === 'blank'
      ? { display: 'flex', alignItems: 'center', justifyContent: 'center' }
      : { display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };

  const pageId = isScreen ? `preview-page-${pageNum}` : undefined;
  const pageClass = isScreen
    ? `${fontClass} relative shadow-xl overflow-hidden flex print-sheet`
    : 'print-sheet';

  return (
    <div
      id={pageId}
      className={pageClass}
      style={pageBaseStyle}
    >
      {/* Crop marks (print only) */}
      <CropMarksRenderer
        isScreen={isScreen}
        showCropMarks={settings.showCropMarks}
      />

      {/* Content container - varies by layout type */}
      <div style={containerLayoutStyle}>
        {/* Running head - used by specific layouts */}
        {(layoutType === 'body' || layoutType === 'sequence' || layoutType === 'header-body') && (
          <RunningHeadRenderer
            show={settings.showRunningHead}
            isScreen={isScreen}
            unit={unit}
            position={{ top: pTopPx, left: paddingLeft }}
            contentWidth={contentWidthStr}
            fontSize={isScreen ? '11px' : '7.5pt'}
            fontPx={fontPx}
            type={layoutType === 'body' ? 'book' : 'section'}
            book={layoutType === 'body' ? book : undefined}
            pageTitle={layoutType === 'body' ? undefined : safePage.title}
            isRightPage={isRightPage}
          />
        )}

        {/* Layout-specific content */}
        <LayoutContentComponent {...contentProps} />
      </div>

      {/* Page number (absolute positioned) */}
      <PageNumberRenderer
        pageNum={pageNum}
        isRightPage={isRightPage}
        isScreen={isScreen}
        unit={unit}
        paddingLeft={paddingLeft}
        contentWidth={contentWidthStr}
        fontSize={isScreen ? '11px' : '7.5pt'}
        settings={settings}
        marginBottom={uN(settings.margins.bottom / 2.5)}
      />
    </div>
  );
}
