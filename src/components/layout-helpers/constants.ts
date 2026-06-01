/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book, Page, PrintSettings, TocEntry } from '../../types';
import type { PaperTheme } from '../BookSpreadReader';

/**
 * Props shared by all layout content renderers
 */
export interface LayoutContentProps {
  page: Page;
  book: Book;
  settings: PrintSettings;
  isScreen: boolean;
  isRightPage: boolean;
  paperTheme: PaperTheme;  // Paper theme (creamy, white, sepia, dark)
  /** Units factory: converts mm to string with appropriate unit (px or mm) */
  u: (mm: number) => string;
  /** Units factory for font sizes: multiplies base font by factor */
  uF: (factor: number) => string;
  /** Units factory returning numeric value */
  uFn: (factor: number) => number;
  /** Units factory returning numeric mm value */
  uN: (mm: number) => number;
  /** Content width in appropriate units */
  contentWidth: string;
  /** Numeric font size */
  fontPx: number;
  /** Font family string */
  fontFamily: string;
  /** Unit string ('px' for screen, 'mm' for print) */
  unit: string;
}

/**
 * Paper theme colors (background/foreground)
 */
export type PaperThemeType = 'creamy' | 'white' | 'sepia' | 'dark';

export interface ThemeEntry {
  bg: string;
  text: string;
  bgColor: string;
  fgColor: string;
}

export const PAPER_THEME_MAP: Record<PaperThemeType, ThemeEntry> = {
  creamy: {
    bg: 'bg-[#FAF6EC]',
    text: 'text-[#2C261F]',
    bgColor: '#FAF6EC',
    fgColor: '#2C261F',
  },
  white: {
    bg: 'bg-[#FFFFFF]',
    text: 'text-slate-800',
    bgColor: '#FFFFFF',
    fgColor: '#1e1e1e',
  },
  sepia: {
    bg: 'bg-[#EBDCB9]',
    text: 'text-[#432A15]',
    bgColor: '#EBDCB9',
    fgColor: '#432A15',
  },
  dark: {
    bg: 'bg-[#2E2E2E]',
    text: 'text-[#ECECE2]',
    bgColor: '#2E2E2E',
    fgColor: '#ECECE2',
  },
};

/**
 * Cover theme colors (used only in cover layout)
 */
export type CoverThemeType = 'classic' | 'modern' | 'academic' | 'zen';

export interface CoverThemeEntry {
  bg: string;
  fg: string;
  accent: string;
}

export const COVER_THEME_MAP: Record<CoverThemeType, CoverThemeEntry> = {
  classic: {
    bg: '#2C261F',
    fg: '#FAF6EC',
    accent: '#9A8272',
  },
  modern: {
    bg: '#111111',
    fg: '#ffffff',
    accent: '#888888',
  },
  academic: {
    bg: '#1E3A5F',
    fg: '#ffffff',
    accent: '#6b9bd2',
  },
  zen: {
    bg: '#f9f9f7',
    fg: '#333333',
    accent: '#999999',
  },
};

/**
 * Card colors for TOC layout based on paper theme
 */
export interface CardColors {
  cardBg: string;
  cardBorder: string;
}

export const CARD_COLORS_MAP: Record<PaperThemeType, CardColors> = {
  creamy: {
    cardBg: '#F5F0E8',
    cardBorder: '#E8E0D4',
  },
  white: {
    cardBg: '#F8F8F8',
    cardBorder: '#E0E0E0',
  },
  sepia: {
    cardBg: '#E0D0A8',
    cardBorder: '#D0C0A0',
  },
  dark: {
    cardBg: '#3A3A3A',
    cardBorder: '#555555',
  },
};

/**
 * Font class names for Tailwind CSS
 */
export const FONT_CLASS_MAP: Record<string, string> = {
  'Noto Serif KR': 'font-serif',
  'Inter': 'font-sans',
  'Fira Code': 'font-mono',
  'Playfair Display': 'font-serif',
};

/**
 * Font family CSS values
 */
export const FONT_FAMILY_MAP: Record<string, string> = {
  'Noto Serif KR': '"Noto Serif KR", serif',
  'Inter': 'Inter, sans-serif',
  'Playfair Display': '"Playfair Display", serif',
  'Fira Code': '"Fira Code", monospace',
};

/**
 * Print color adjust styles for exact color reproduction
 */
export const PRINT_COLOR_ADJUST_STYLE = {
  WebkitPrintColorAdjust: 'exact' as const,
  printColorAdjust: 'exact' as const,
};

/**
 * Layout-specific display configuration
 * Controls whether certain UI elements (page number, running head) should be displayed by default
 * These can be overridden by global settings, but provide sensible defaults per layout type
 */
export interface LayoutConfig {
  showPageNumbers: boolean;   // Whether page numbers should be visible by default
  showRunningHead: boolean;   // Whether running head should be visible by default
  containerLayout: 'center' | 'space-between';  // How to position content within page
}

export type PageLayoutType = 'cover' | 'toc' | 'chapter' | 'body' | 'header-body' | 'quote' | 'sequence' | 'blank';

/**
 * Default configuration for each layout type
 * These are combined with global settings.showPageNumbers/showRunningHead
 * 
 * - cover: No page numbers (표지 디자인), no running head
 * - toc: Both enabled (page numbers for reference navigation)
 * - chapter: No page numbers (챕터 타이틀 전용), no running head
 * - body: Both enabled (standard text layout)
 * - header-body: Both enabled (same as body)
 * - quote: Both enabled
 * - sequence: Both enabled
 * - blank: No page numbers (intentionally blank), no running head
 */
export const LAYOUT_CONFIG_MAP: Record<PageLayoutType, LayoutConfig> = {
  cover: {
    showPageNumbers: false,
    showRunningHead: false,
    containerLayout: 'center',
  },
  toc: {
    showPageNumbers: true,
    showRunningHead: false,
    containerLayout: 'space-between',
  },
  chapter: {
    showPageNumbers: false,
    showRunningHead: false,
    containerLayout: 'center',
  },
  body: {
    showPageNumbers: true,
    showRunningHead: true,
    containerLayout: 'space-between',
  },
  'header-body': {
    showPageNumbers: true,
    showRunningHead: true,
    containerLayout: 'space-between',
  },
  quote: {
    showPageNumbers: true,
    showRunningHead: false,
    containerLayout: 'center',
  },
  sequence: {
    showPageNumbers: true,
    showRunningHead: true,
    containerLayout: 'space-between',
  },
  blank: {
    showPageNumbers: false,
    showRunningHead: false,
    containerLayout: 'center',
  },
};

/**
 * Get layout configuration by layout type
 * Falls back to 'body' config if type is not recognized
 */
export function getLayoutConfig(layoutType: string): LayoutConfig {
  return LAYOUT_CONFIG_MAP[(layoutType as PageLayoutType) || 'body'] || LAYOUT_CONFIG_MAP.body;
}
