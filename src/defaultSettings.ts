import { PageUnion, BookProject } from './types';

/**
 * 기본 설정값 (하드코딩)
 * Defaults 시트 없이 코드에서 직접 관리
 */

export const DEFAULT_SETTINGS = {
  theme: 'classic',
  paperSize: 'a5',
  margins: {
    top: 21,
    bottom: 21,
    inner: 21,
    outer: 15,
  },
  fontFamily: 'Noto Serif KR',
  fontSize: 10,
  lineHeight: 1.65,
  showCropMarks: true,
  showPageNumbers: true,
  showRunningHead: true,
  bleed: 3,
} as const;

/**
 * GAS 로드 실패 시 표시할 기본 페이지들
 */
export const DEFAULT_PAGES: PageUnion[] = [
  {
    id: 'default-cover',
    layoutType: 'cover',
    title: '(디폴트) 새로운 책',
    author: '(디폴트) Google Sheets 데이터 없음',
  } as const,
  {
    id: 'default-body',
    layoutType: 'body',
    title: '(디폴트) 본문',
    content: '(디폴트) 본문 내용이 여기에 표시됩니다.\n\nGoogle Sheets에서 데이터를 불러올 수 없어 기본값으로 표시됩니다.',
  } as const,
];

/**
 * GAS 로드 실패 시 표시할 기본 프로젝트
 */
export const createDefaultBookProject = (): BookProject => ({
  title: '(디폴트) 새로운 책',
  author: '(디폴트) 저자 미정',
  theme: DEFAULT_SETTINGS.theme as any,
  paperSize: DEFAULT_SETTINGS.paperSize,
  margins: DEFAULT_SETTINGS.margins,
  fontFamily: DEFAULT_SETTINGS.fontFamily as any,
  fontSize: DEFAULT_SETTINGS.fontSize,
  lineHeight: DEFAULT_SETTINGS.lineHeight,
  showCropMarks: DEFAULT_SETTINGS.showCropMarks,
  showPageNumbers: DEFAULT_SETTINGS.showPageNumbers,
  showRunningHead: DEFAULT_SETTINGS.showRunningHead,
  bleed: DEFAULT_SETTINGS.bleed,
  pages: DEFAULT_PAGES as any,
});
