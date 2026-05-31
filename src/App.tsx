/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Book, Page, PageLayoutType, PrintSettings } from './types';
import { useEbookSheet } from './hooks/useEbookSheet';
import { BOOKS_TEMPLATES } from './bookTemplates';
import BookEditor from './components/BookEditor';
import PrintSurface from './components/PrintSurface';
import DocumentStructure from './components/DocumentStructure';
import {
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  BookMarked,
  SunDim,
  Download,
  Upload,
} from 'lucide-react';
import BookSpreadReader, { PaperTheme } from './components/BookSpreadReader';

export default function App() {
  const [book, setBook] = useState<Book>(BOOKS_TEMPLATES[0]);

  // Edit vs read mode
  const [isEditMode, setIsEditMode] = useState<boolean>(true);

  // Page navigation state
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [currentPageSpread, setCurrentPageSpread] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'single' | 'double'>('double');
  const [paperTheme, setPaperTheme] = useState<PaperTheme>('creamy');

  // Calibration scale (px per mm)
  const [scale, setScale] = useState<number>(() => {
    const saved = localStorage.getItem('prepress-calibration-scale');
    return saved ? parseFloat(saved) : 3.78;
  });

  // Print settings
  const [settings, setSettings] = useState<PrintSettings>({
    paperSizeId: 'a5',
    margins: { top: 22, bottom: 22, inner: 22, outer: 18 },
    fontFamily: 'Noto Serif KR',
    fontSize: 10,
    lineHeight: 1.65,
    showCropMarks: true,
    showPageNumbers: true,
    showRunningHead: true,
    bleed: 3,
  });

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    localStorage.setItem('prepress-calibration-scale', newScale.toString());
  };

  const GAS_URL = 'https://script.google.com/macros/s/AKfycbzuKJeAilzBvMxixy4DK4vxnhxinpbAlQhRMsmym5WpCDMUhClmvdjzodGTwXPDXXVr/exec';
  const { status: gasStatus, message: gasMessage, loadFromSheets, saveToSheets } = useEbookSheet(GAS_URL);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 앱 시작 시 Google Sheets에서 자동 로드
  useEffect(() => {
    (async () => {
      const result = await loadFromSheets(book);
      if (result) {
        setBook(result.book);
        if (result.paperSizeId) {
          setSettings((prev) => ({
            ...prev,
            paperSizeId: result.paperSizeId!,
            ...(result.bindingMargin != null && {
              margins: { ...prev.margins, inner: result.bindingMargin! },
            }),
          }));
        }
        setSelectedPageIndex(0);
        setCurrentPageSpread(0);
      }
      setIsInitialLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = book.pages.length;

  // ── Page selection (syncs spread) ──
  const handleSelectPage = (index: number) => {
    setSelectedPageIndex(index);
    setCurrentPageSpread(viewMode === 'double' ? Math.floor(index / 2) * 2 : index);
  };

  // ── View mode toggle ──
  const handleViewModeChange = (mode: 'single' | 'double') => {
    setViewMode(mode);
    setCurrentPageSpread(mode === 'double' ? Math.floor(currentPageSpread / 2) * 2 : currentPageSpread);
  };

  // ── Navigation ──
  const step = viewMode === 'double' ? 2 : 1;
  const isAtStart = currentPageSpread === 0;
  const isAtEnd = currentPageSpread + step >= totalPages;

  const handlePrevSpread = () => {
    const next = Math.max(0, currentPageSpread - step);
    setCurrentPageSpread(next);
    setSelectedPageIndex(next);
  };

  const handleNextSpread = () => {
    if (!isAtEnd) {
      const next = currentPageSpread + step;
      setCurrentPageSpread(next);
      setSelectedPageIndex(next);
    }
  };

  // ── Book mutations ──
  const handleUpdatePageText = (pageId: string, text: string) => {
    const updatedPages = book.pages.map((p) =>
      p.id === pageId ? { ...p, content: text } : p
    );
    handleUpdateBook({ ...book, pages: updatedPages });
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setBook(updatedBook);
  };

  const handleUpdatePageMeta = (pageId: string, updates: Partial<Pick<Page, 'title' | 'content'>>) => {
    const updatedPages = book.pages.map((p) =>
      p.id === pageId ? { ...p, ...updates } : p
    );
    handleUpdateBook({ ...book, pages: updatedPages });
  };

  const handleUpdatePageTitle = (pageId: string, title: string) => {
    handleUpdatePageMeta(pageId, { title });
  };

  // Insert page AFTER current selection
  const handleAddPage = (layoutType: PageLayoutType) => {
    const ts = Date.now();
    const newPage: Page = { id: `p-${ts}`, layoutType, content: '', title: '' };
    const insertIndex = selectedPageIndex + 1;
    const updatedPages = [
      ...book.pages.slice(0, insertIndex),
      newPage,
      ...book.pages.slice(insertIndex),
    ];
    handleUpdateBook({ ...book, pages: updatedPages });
    handleSelectPage(insertIndex);
  };

  const handleDeletePage = (pageId: string) => {
    const pageIndex = book.pages.findIndex((p) => p.id === pageId);
    const updatedPages = book.pages.filter((p) => p.id !== pageId);
    handleUpdateBook({ ...book, pages: updatedPages });
    const newIdx = pageIndex >= updatedPages.length
      ? Math.max(0, updatedPages.length - 1)
      : pageIndex < selectedPageIndex
      ? selectedPageIndex - 1
      : selectedPageIndex;
    handleSelectPage(Math.min(newIdx, updatedPages.length - 1));
  };

  const handleReorderPages = (pages: Page[]) => {
    handleUpdateBook({ ...book, pages });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToSheets = async () => {
    await saveToSheets(book, settings);
  };

  const handleLoadFromSheets = async () => {
    const result = await loadFromSheets(book);
    if (result) {
      setBook(result.book);
      if (result.paperSizeId) {
        setSettings((prev) => ({
          ...prev,
          paperSizeId: result.paperSizeId!,
          ...(result.bindingMargin != null && {
            margins: { ...prev.margins, inner: result.bindingMargin! },
          }),
        }));
      }
      setSelectedPageIndex(0);
      setCurrentPageSpread(0);
    }
  };

  const spreadLabel = viewMode === 'double'
    ? `${currentPageSpread + 1}–${Math.min(totalPages, currentPageSpread + 2)} / ${totalPages}`
    : `${currentPageSpread + 1} / ${totalPages}`;

  const PAPER_THEME_COLORS: Record<PaperTheme, string> = {
    creamy: '#FAF6EC',
    white:  '#FFFFFF',
    sepia:  '#EBDCB9',
    dark:   '#2E2E2E',
  };

  return (
    <div className="h-screen flex flex-col font-sans" style={{ backgroundColor: '#FDFAF6', color: '#2A2420' }}>

      {/* ── INITIAL LOADING OVERLAY ── */}
      {isInitialLoading && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5"
          style={{ backgroundColor: '#2C261F' }}
        >
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: '#FAF6EC', borderTopColor: 'transparent' }}
          />
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[15px] font-serif font-semibold" style={{ color: '#FAF6EC' }}>Google Sheets에서 불러오는 중</span>
            <span className="text-[11px] font-mono" style={{ color: 'rgba(250,246,236,0.4)' }}>잠시만 기다려 주세요…</span>
          </div>
        </div>
      )}

      {/* ── MAIN 3-COLUMN LAYOUT ── */}
      <main className="flex-1 flex overflow-hidden no-print">

        {/* ── LEFT: Page Navigation ── */}
        <DocumentStructure
          book={book}
          selectedPageIndex={selectedPageIndex}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          onUpdatePageTitle={handleUpdatePageTitle}
          onReorderPages={handleReorderPages}
        />

        {/* ── CENTER: Book View ── */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#F5F0E8' }}>

          {/* Center Toolbar */}
          <div
            className="shrink-0 flex items-center justify-between px-4 py-2 gap-3"
            style={{ backgroundColor: '#FDFAF6', borderBottom: '1px solid #E8E0D4' }}
          >
            {/* Left: Edit / Read mode */}
            <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: '1px solid #E8E0D4' }}>
              <button
                onClick={() => setIsEditMode(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors"
                style={{ backgroundColor: !isEditMode ? '#2A2420' : '#FDFAF6', color: !isEditMode ? '#fff' : '#7A6F66' }}
              >
                <Eye size={12} /> 읽기
              </button>
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors"
                style={{ backgroundColor: isEditMode ? '#B5714A' : '#FDFAF6', color: isEditMode ? '#fff' : '#7A6F66' }}
              >
                <Edit2 size={12} /> 편집
              </button>
            </div>

            {/* Center: View mode + navigation */}
            <div className="flex items-center gap-2">
              {/* View mode */}
              <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: '1px solid #E8E0D4' }}>
                <button
                  onClick={() => handleViewModeChange('single')}
                  title="1쪽 보기"
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors"
                  style={{ backgroundColor: viewMode === 'single' ? '#2A2420' : '#FDFAF6', color: viewMode === 'single' ? '#fff' : '#7A6F66' }}
                >
                  <BookOpen size={12} /> 1쪽
                </button>
                <button
                  onClick={() => handleViewModeChange('double')}
                  title="2쪽 보기"
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors"
                  style={{ backgroundColor: viewMode === 'double' ? '#2A2420' : '#FDFAF6', color: viewMode === 'double' ? '#fff' : '#7A6F66' }}
                >
                  <BookMarked size={12} /> 2쪽
                </button>
              </div>

              {/* Navigation */}
              <button
                onClick={handlePrevSpread}
                disabled={isAtStart}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#FDFAF6', border: '1px solid #E8E0D4', color: '#2A2420' }}
              >
                <ChevronLeft size={13} /> 이전
              </button>
              <span
                className="text-[11px] font-semibold font-mono px-2.5 py-1.5 rounded-lg select-none shrink-0"
                style={{ backgroundColor: '#F5F0E8', color: '#7A6F66', border: '1px solid #E8E0D4' }}
              >
                {spreadLabel}
              </span>
              <button
                onClick={handleNextSpread}
                disabled={isAtEnd}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#FDFAF6', border: '1px solid #E8E0D4', color: '#2A2420' }}
              >
                다음 <ChevronRight size={13} />
              </button>
            </div>

            {/* Right: GAS + Paper theme */}
            <div className="flex items-center gap-2 shrink-0">
              {/* GAS Save / Load */}
              <div className="flex items-center gap-0 rounded-lg overflow-hidden" style={{ border: '1px solid #E8E0D4' }}>
                <button
                  onClick={handleLoadFromSheets}
                  disabled={gasStatus === 'loading' || gasStatus === 'saving'}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FDFAF6', color: '#7A6F66' }}
                  title="Google Sheets에서 불러오기"
                >
                  <Download size={12} />
                  {gasStatus === 'loading' ? '로딩중…' : '불러오기'}
                </button>
                <div style={{ width: 1, height: 16, backgroundColor: '#E8E0D4', flexShrink: 0 }} />
                <button
                  onClick={handleSaveToSheets}
                  disabled={gasStatus === 'loading' || gasStatus === 'saving'}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: gasStatus === 'saving' ? '#7A4F30' : '#B5714A',
                    color: '#fff',
                  }}
                  title="Google Sheets에 저장"
                >
                  <Upload size={12} />
                  {gasStatus === 'saving' ? '저장중…' : '저장'}
                </button>
              </div>
              {gasMessage && (
                <span
                  className="text-[10px] font-medium max-w-[100px] truncate shrink-0"
                  style={{ color: gasStatus === 'error' ? '#C0392B' : '#5B8A5B' }}
                  title={gasMessage}
                >
                  {gasMessage}
                </span>
              )}
              <div className="shrink-0" style={{ width: 1, height: 16, backgroundColor: '#E8E0D4' }} />
              <SunDim size={13} style={{ color: '#B4A99E' }} />
              {(Object.keys(PAPER_THEME_COLORS) as PaperTheme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setPaperTheme(theme)}
                  className="w-5 h-5 rounded-full border-2 cursor-pointer transition-all hover:scale-110"
                  style={{
                    backgroundColor: PAPER_THEME_COLORS[theme],
                    borderColor: paperTheme === theme ? '#B5714A' : '#D0C8BE',
                    outline: paperTheme === theme ? '2px solid #B5714A' : 'none',
                    outlineOffset: '1px',
                  }}
                  title={theme}
                />
              ))}
            </div>
          </div>

          {/* Book Display */}
          <div className="flex-1 overflow-auto">
            <BookSpreadReader
              book={book}
              settings={settings}
              scale={scale}
              onUpdatePageText={handleUpdatePageText}
              isEditMode={isEditMode}
              viewMode={viewMode}
              currentPageSpread={currentPageSpread}
              paperTheme={paperTheme}
            />
          </div>
        </div>

        {/* ── RIGHT: Options Panel ── */}
        <BookEditor
          book={book}
          settings={settings}
          selectedPageIndex={selectedPageIndex}
          scale={scale}
          onChangeSettings={setSettings}
          onUpdateBook={handleUpdateBook}
          onUpdatePageMeta={handleUpdatePageMeta}
          onChangeScale={handleScaleChange}
          onPrint={handlePrint}
        />
      </main>

      {/* Printable DOM (hidden on screen) */}
      <PrintSurface book={book} settings={settings} />
    </div>
  );
}


