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
  getLayoutConfig,
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
  currentSectionTitle?: string; // For running heads (most recent section title)
} & ModeProps;

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function PageRenderer(props: PageRendererProps) {
  const { page, pageIndex, isRightPage, book, settings, currentSectionTitle } = props;

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

  // ── Get layout configuration ──
  const layoutConfig = getLayoutConfig(layoutType);

  // ── Determine visibility based on layout type ──
  // Use page-type-specific settings from metadata (pageTypeVisibility)
  // Falls back to global settings if pageTypeVisibility not available
  const typeVisibility = settings.pageTypeVisibility?.[layoutType];
  const showPageNumbers = typeVisibility?.showPageNumbers ?? settings.showPageNumbers;
  const showRunningHead = typeVisibility?.showRunningHead ?? settings.showRunningHead;

  // ── Paper theme ──
  const themeEntry = PAPER_THEME_MAP[paperTheme] || PAPER_THEME_MAP.white;
  // Synchronize theme classes between screen and print modes
  const themeClasses = { bg: themeEntry.bg, text: themeEntry.text };
  const bgColorStyle = themeEntry.bgColor;
  const fgColorStyle = themeEntry.fgColor;
  // FIXME: Review if print-specific color adjustments are needed
  const printColorAdjust = {};

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
    fontFamily: fontFamily,
  };

  // FIXME: Determine if print mode needs different font size (currently uses uF(1) for both)
  // Object.assign(pageBaseStyle, printColorAdjust);

  // ── Determine page layout container structure ──
  // Use layout config to determine positioning
  const containerLayoutStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: layoutConfig.containerLayout === 'center' ? 'center' : 'stretch',
    justifyContent: layoutConfig.containerLayout === 'center' ? 'center' : 'space-between',
    ...(layoutConfig.containerLayout === 'center' && { textAlign: 'center' }),
  };

  // Synchronize visual styling between screen and print modes for WYSIWYG
  const pageId = isScreen ? `preview-page-${pageNum}` : undefined;
  const pageClass = `${fontClass} relative shadow-xl overflow-hidden flex print-sheet`;

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

      {/* Determine if running head can be shown for this layout type */}
      {(() => {
        // Use pageTypeVisibility from GAS metadata for all layout types
        const typeVisibility = settings.pageTypeVisibility?.[layoutType];
        const canShowRunningHead = typeVisibility?.showRunningHead ?? settings.showRunningHead;
        
        return (
          <div style={{
            ...containerLayoutStyle,
            marginTop: canShowRunningHead
              ? (isScreen ? '28px' : '5mm')
              : 0,
          }}>
            {/* Running head - controlled by GAS metadata */}
            {canShowRunningHead && (
              <RunningHeadRenderer
                show={true}
                isScreen={isScreen}
                unit={unit}
                position={{ top: pTopPx, left: paddingLeft }}
                contentWidth={contentWidthStr}
                fontSize={isScreen ? '11px' : '7.5pt'}
                fontPx={fontPx}
                type={layoutType === 'body' ? 'book' : 'section'}
                book={layoutType === 'body' ? book : undefined}
                pageTitle={layoutType === 'body' ? undefined : currentSectionTitle}
                isRightPage={isRightPage}
              />
            )}

            {/* Layout-specific content */}
            <LayoutContentComponent {...contentProps} />
          </div>
        );
      })()}

      {/* Page number (absolute positioned) */}
      {showPageNumbers && (
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
      )}
    </div>
  );
}
