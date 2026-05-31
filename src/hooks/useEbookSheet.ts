import { useState } from 'react';
import { Book, Page, PageLayoutType, PrintSettings } from '../types';

type SheetStatus = 'idle' | 'loading' | 'saving' | 'success' | 'error';
type GasPageType = 'cover' | 'toc' | 'chapter' | 'sequence' | 'body' | 'header-body' | 'quote';
type GasPageObject = Record<string, unknown>;

// React layoutType → GAS page type
const LAYOUT_TO_GAS: Partial<Record<PageLayoutType, GasPageType>> = {
  cover: 'cover',
  toc: 'toc',
  chapter: 'chapter',
  sequence: 'sequence',
  body: 'body',
  'title-body': 'header-body',
  quote: 'quote',
};

// GAS page type → React layoutType
const GAS_TO_LAYOUT: Record<GasPageType, PageLayoutType> = {
  cover: 'cover',
  toc: 'toc',
  chapter: 'chapter',
  sequence: 'sequence',
  body: 'body',
  'header-body': 'title-body',
  quote: 'quote',
};

function pageToGasObject(page: Page, book: Book): GasPageObject | null {
  const gasType = LAYOUT_TO_GAS[page.layoutType];
  if (!gasType) return null;
  const base = { id: page.id, type: gasType };

  switch (gasType) {
    case 'cover':
      return { ...base, title: page.content, subtitle: book.subtitle ?? '', author: book.author };
    case 'toc': {
      let tocEntries: unknown[] = [];
      try { tocEntries = JSON.parse(page.content); } catch { tocEntries = []; }
      return { ...base, title: page.title ?? '', tocEntries };
    }
    case 'chapter':
      return { ...base, chapterTitle: page.title ?? '', chapterSubtitle: '', content: page.content };
    case 'sequence':
      return { ...base, title: page.title ?? '', content: page.content, items: [] };
    case 'body':
      return { ...base, content: page.content };
    case 'header-body':
      return { ...base, title: page.title ?? '', content: page.content };
    case 'quote':
      return { ...base, title: page.title ?? '', content: page.content };
    default:
      return null;
  }
}

function gasObjectToPage(obj: GasPageObject): Page {
  const gasType = obj.type as GasPageType;
  const layoutType: PageLayoutType = GAS_TO_LAYOUT[gasType] ?? 'body';
  // prefix with gasType to ensure uniqueness across sheets (GAS may return same row-N from different sheets)
  const rawId = obj.id ? String(obj.id) : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const id = `${gasType}-${rawId}`;

  switch (gasType) {
    case 'cover':
      return { id, layoutType, content: (obj.title as string) ?? '', title: '' };
    case 'toc': {
      const entries = Array.isArray(obj.tocEntries) ? obj.tocEntries : [];
      return { id, layoutType, title: (obj.title as string) ?? '목차', content: JSON.stringify(entries) };
    }
    case 'chapter':
      return { id, layoutType, title: (obj.chapterTitle as string) ?? '', content: (obj.content as string) ?? '' };
    case 'body':
      return { id, layoutType, content: (obj.content as string) ?? '', title: '' };
    case 'header-body':
    case 'quote':
    case 'sequence':
      return { id, layoutType, title: (obj.title as string) ?? '', content: (obj.content as string) ?? '' };
    default:
      return { id, layoutType: 'body', content: '', title: '' };
  }
}

export interface SheetLoadResult {
  book: Book;
  paperSizeId?: string;
  bindingMargin?: number;
}

export function useEbookSheet(gasWebAppUrl: string) {
  const [status, setStatus] = useState<SheetStatus>('idle');
  const [message, setMessage] = useState('');

  const loadFromSheets = async (currentBook: Book): Promise<SheetLoadResult | null> => {
    if (!gasWebAppUrl) {
      setStatus('error');
      setMessage('GAS URL이 설정되지 않았습니다.');
      return null;
    }
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch(gasWebAppUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status !== 'success') throw new Error((json.message as string) ?? '불러오기 실패');

      const rawPages: GasPageObject[] = Array.isArray(json.pages) ? json.pages : [];
      const pages: Page[] = rawPages.map(gasObjectToPage);

      // Extract author / subtitle from cover page data
      const coverRaw = rawPages.find((p) => p.type === 'cover');
      const author = (coverRaw?.author as string) || currentBook.author;
      const subtitle = (coverRaw?.subtitle as string) || currentBook.subtitle;

      const loadedBook: Book = {
        ...currentBook,
        title: (json.metadata?.title as string) || currentBook.title,
        theme: (json.metadata?.theme as Book['theme']) || currentBook.theme,
        author,
        subtitle,
        pages,
      };

      setStatus('success');
      setMessage('Google Sheets에서 불러왔습니다.');
      return {
        book: loadedBook,
        paperSizeId: (json.metadata?.standard as string)?.toLowerCase(),
        bindingMargin: json.metadata?.bindingMargin as number | undefined,
      };
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : '불러오기 실패');
      return null;
    }
  };

  const saveToSheets = async (book: Book, settings: PrintSettings): Promise<boolean> => {
    if (!gasWebAppUrl) {
      setStatus('error');
      setMessage('GAS URL이 설정되지 않았습니다.');
      return false;
    }
    setStatus('saving');
    setMessage('');
    try {
      const pages = book.pages.map((p) => pageToGasObject(p, book)).filter(Boolean);

      const payload = {
        action: 'syncAll',
        data: {
          metadata: {
            title: book.title,
            theme: book.theme,
            standard: settings.paperSizeId.toUpperCase(),
            bindingMargin: settings.margins.inner,
          },
          pages,
        },
      };

      // Content-Type: text/plain avoids CORS preflight for GAS web apps
      const res = await fetch(gasWebAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status !== 'success') throw new Error((json.message as string) ?? '저장 실패');

      setStatus('success');
      setMessage('Google Sheets에 저장되었습니다.');
      return true;
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : '저장 실패');
      return false;
    }
  };

  return { status, message, loadFromSheets, saveToSheets };
}
