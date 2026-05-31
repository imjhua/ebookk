/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PaperSize {
  id: string;
  name: string;
  width: number; // in mm
  height: number; // in mm
  description: string;
}

export interface Margins {
  top: number; // mm
  bottom: number; // mm
  inner: number; // mm (Gutter / Left-right binding edge)
  outer: number; // mm (Outside edges)
}

export type PageLayoutType = 'body' | 'title' | 'poem' | 'quote' | 'blank';

export interface Page {
  id: string;
  layoutType: PageLayoutType;
  content: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  subtitle?: string;
  publisher?: string;
  coverStyle: 'minimal' | 'classic' | 'modern' | 'editorial';
  coverTheme: 'slate' | 'navy' | 'forest' | 'terracotta' | 'parchment' | 'gold';
  pages: Page[];
}

export interface PrintSettings {
  paperSizeId: string;
  margins: Margins;
  fontFamily: 'Noto Serif KR' | 'Inter' | 'Fira Code' | 'Playfair Display';
  fontSize: number; // in pt (e.g. 10, 10.5, 11, 12)
  lineHeight: number; // e.g. 1.6, 1.8
  showCropMarks: boolean;
  showPageNumbers: boolean;
  showRunningHead: boolean;
  bleed: number; // bleed margin in mm (default 3)
}

export const PRESET_PAPER_SIZES: PaperSize[] = [
  {
    id: 'a5',
    name: 'A5 판형 (소설, 수필용)',
    width: 148,
    height: 210,
    description: '가장 널리 쓰이는 표준 단행본 사이즈 (148 x 210 mm)',
  },
  {
    id: 'b6',
    name: 'B6 판형 (시집, 에세이용)',
    width: 128,
    height: 182,
    description: '작고 아담한 시집이나 감성 에세이 규격 (128 x 182 mm)',
  },
  {
    id: 'pocket',
    name: '포켓 신국판 (소형 문고판)',
    width: 108,
    height: 175,
    description: '한 손에 쏙 들어오는 문고 판형 사이즈 (108 x 175 mm)',
  },
  {
    id: 'singuk',
    name: '신국판 (표준 학술/전문 서적)',
    width: 152,
    height: 225,
    description: '인지도 높은 단행본 및 인문학 서적 사이즈 (152 x 225 mm)',
  },
  {
    id: 'a4',
    name: 'A4 판형 (대형 기술/화보기집)',
    width: 210,
    height: 297,
    description: '잡지, 기술 서적 및 워크북에 쓰이는 대형 판형 (210 x 297 mm)',
  }
];

export const DEFAULT_PREVIEW_SCALE = 3.5; // Default pixels per mm for screen rendering
