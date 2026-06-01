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

export type PageLayoutType = 'cover' | 'toc' | 'chapter' | 'body' | 'quote' | 'sequence' | 'header-body' | 'blank';
export type BookTheme = 'classic' | 'modern' | 'academic' | 'zen';

/**
 * 레이아웃타입별 메타데이터
 * 각 레이아웃의 필수 필드, 설명, 용도를 정의합니다.
 */
export interface LayoutTypeMetadata {
  id: PageLayoutType;
  label: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
}

export const LAYOUT_METADATA: Record<PageLayoutType, LayoutTypeMetadata> = {
  cover: {
    id: 'cover',
    label: '표지',
    description: '책의 표지, 제목/저자/부제목 중앙 배치',
    requiredFields: ['title'],
    optionalFields: ['subtitle', 'author'],
  },
  toc: {
    id: 'toc',
    label: '목차',
    description: '목차 페이지, 챕터 카드 형식 표시',
    requiredFields: ['tocEntries'],
    optionalFields: ['title'],
  },
  chapter: {
    id: 'chapter',
    label: '챕터 제목',
    description: '큼직한 챕터 제목, PART 표시',
    requiredFields: ['title'],
    optionalFields: ['content'],
  },
  body: {
    id: 'body',
    label: '본문',
    description: '기본 본문 페이지, drop cap 및 running head 포함',
    requiredFields: ['content'],
    optionalFields: ['title'],
  },
  'header-body': {
    id: 'header-body',
    label: '제목+본문',
    description: '섹션 제목 위에 본문 텍스트',
    requiredFields: ['title', 'content'],
    optionalFields: [],
  },
  quote: {
    id: 'quote',
    label: '인용구',
    description: '이탤릭 인용 텍스트, 화면 중앙 배치',
    requiredFields: ['content'],
    optionalFields: [],
  },
  sequence: {
    id: 'sequence',
    label: '시퀀스',
    description: '좌우 정렬 텍스트 (시 형식), running head 포함',
    requiredFields: ['content'],
    optionalFields: ['title'],
  },
  blank: {
    id: 'blank',
    label: '빈페이지',
    description: '완전히 빈 페이지, 페이지번호만 표시 가능',
    requiredFields: [],
    optionalFields: [],
  },
};

export interface TocEntry {
  chapter: string;
  pageNum: number;
  title: string;
}

/**
 * 기저 Page 인터페이스 (호환성 유지)
 * 런타임에서 동적으로 타입을 확인할 때 사용
 */
export interface Page {
  id: string;
  layoutType: PageLayoutType;
  content: string;
  title?: string;
  subtitle?: string;
  author?: string;
  tocEntries?: TocEntry[];
  items?: string[];
}

/**
 * Discriminated Union: layoutType별 필드 검증
 * TypeScript 컴파일 타임에 올바른 필드 접근을 보장합니다.
 * 예: page.layoutType === 'cover'일 때만 title, author 사용 가능
 */
export type PageUnion =
  | { layoutType: 'cover'; title: string; subtitle?: string; author?: string; content?: never; tocEntries?: never; items?: never; id: string; }
  | { layoutType: 'toc'; tocEntries: TocEntry[]; items?: string[]; title?: string; content?: never; subtitle?: never; author?: never; id: string; }
  | { layoutType: 'chapter'; title: string; content?: string; id: string; subtitle?: never; author?: never; tocEntries?: never; items?: never; }
  | { layoutType: 'body'; content: string; title?: string; id: string; subtitle?: never; author?: never; tocEntries?: never; items?: never; }
  | { layoutType: 'header-body'; title: string; content: string; id: string; subtitle?: never; author?: never; tocEntries?: never; items?: never; }
  | { layoutType: 'quote'; content: string; id: string; title?: never; subtitle?: never; author?: never; tocEntries?: never; items?: never; }
  | { layoutType: 'sequence'; content: string; title?: string; id: string; subtitle?: never; author?: never; tocEntries?: never; items?: never; }
  | { layoutType: 'blank'; id: string; content?: never; title?: never; subtitle?: never; author?: never; tocEntries?: never; items?: never; };

export interface Book {
  id: string;
  title: string;
  author: string;
  subtitle?: string;
  publisher?: string;
  theme: BookTheme;
  pages: Page[];
}

/** 전체 프로젝트 데이터 (메타데이터 + 페이지 서식) */
export interface BookProject {
  title: string;
  author: string;
  theme: BookTheme;
  paperSize: string;
  margins: Margins;
  fontFamily: 'Noto Serif KR' | 'Inter' | 'Fira Code' | 'Playfair Display';
  fontSize: number;
  lineHeight: number;
  showCropMarks: boolean;
  showPageNumbers: boolean;
  showRunningHead: boolean;
  bleed: number;
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

export interface PageData {
  id: string;
  layoutType: PageLayoutType;
  title?: string;
  subtitle?: string;
  author?: string;
  content?: string;
  items?: string[]; // Legacy TOC
  tocEntries?: TocEntry[]; // New TOC
}
