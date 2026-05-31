/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Book, Page, PageLayoutType, PrintSettings, PRESET_PAPER_SIZES } from './types';
import { BOOKS_TEMPLATES } from './bookTemplates';
import BookEditor from './components/BookEditor';
import PrintSurface from './components/PrintSurface';
import DocumentStructure from './components/DocumentStructure';
import {
  Sparkles,
  Layers,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  BookMarked,
  SunDim,
} from 'lucide-react';
import BookSpreadReader, { PaperTheme } from './components/BookSpreadReader';

export default function App() {
  // Library
  const [booksList, setBooksList] = useState<Book[]>(BOOKS_TEMPLATES);
  const [selectedBookId, setSelectedBookId] = useState<string>(BOOKS_TEMPLATES[0].id);

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

  const currentBook = booksList.find((b) => b.id === selectedBookId) || booksList[0];
  const totalPages = currentBook.pages.length;

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
    const updatedPages = currentBook.pages.map((p) =>
      p.id === pageId ? { ...p, content: text } : p
    );
    handleUpdateBook({ ...currentBook, pages: updatedPages });
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setBooksList(booksList.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
  };

  const handleUpdatePageMeta = (pageId: string, updates: Partial<Pick<Page, 'title' | 'content'>>) => {
    const updatedPages = currentBook.pages.map((p) =>
      p.id === pageId ? { ...p, ...updates } : p
    );
    handleUpdateBook({ ...currentBook, pages: updatedPages });
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
      ...currentBook.pages.slice(0, insertIndex),
      newPage,
      ...currentBook.pages.slice(insertIndex),
    ];
    handleUpdateBook({ ...currentBook, pages: updatedPages });
    handleSelectPage(insertIndex);
  };

  const handleDeletePage = (pageId: string) => {
    const pageIndex = currentBook.pages.findIndex((p) => p.id === pageId);
    const updatedPages = currentBook.pages.filter((p) => p.id !== pageId);
    handleUpdateBook({ ...currentBook, pages: updatedPages });
    const newIdx = pageIndex >= updatedPages.length
      ? Math.max(0, updatedPages.length - 1)
      : pageIndex < selectedPageIndex
      ? selectedPageIndex - 1
      : selectedPageIndex;
    handleSelectPage(Math.min(newIdx, updatedPages.length - 1));
  };

  const handleReorderPages = (pages: Page[]) => {
    handleUpdateBook({ ...currentBook, pages });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateNewBook = () => {
    const ts = Date.now();
    const newBook: Book = {
      id: `book-${ts}`,
      title: '새로운 독립출판 단행본',
      author: '지은이 이름',
      subtitle: '아름다운 서지 설명',
      publisher: '내 방 서재 출판',
      theme: 'classic',
      pages: [
        { id: `p-${ts}-1`, layoutType: 'title',  content: '새로운 책' } as Page,
        { id: `p-${ts}-2`, layoutType: 'body',   content: '여기에 첫 번째 페이지 내용을 입력해 주세요.' } as Page,
      ],
    };
    setBooksList([...booksList, newBook]);
    setSelectedBookId(newBook.id);
    setIsEditMode(true);
    setSelectedPageIndex(0);
    setCurrentPageSpread(0);
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

      {/* ── HEADER ── */}
      <nav
        className="shrink-0 no-print flex items-center justify-between px-5 h-[52px]"
        style={{ backgroundColor: '#FDFAF6', borderBottom: '1px solid #E8E0D4' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2A2420' }}>
            <Layers size={14} className="text-white" />
          </div>
          <span className="text-[12px] font-bold tracking-tight uppercase" style={{ color: '#2A2420' }}>PRESLY</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: '#E8E0D4', color: '#7A6F66' }}>v1.1</span>
        </div>

        {/* Book selector + actions */}
        <div className="flex items-center gap-2">
          <select
            value={selectedBookId}
            onChange={(e) => { setSelectedBookId(e.target.value); setSelectedPageIndex(0); setCurrentPageSpread(0); }}
            className="text-[11px] font-medium px-3 py-1.5 rounded-lg cursor-pointer outline-none"
            style={{ backgroundColor: '#F5F0E8', border: '1px solid #E8E0D4', color: '#2A2420' }}
          >
            {booksList.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
          <button
            onClick={handleCreateNewBook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer"
            style={{ backgroundColor: '#F5F0E8', border: '1px solid #E8E0D4', color: '#2A2420' }}
          >
            <Sparkles size={12} /> 새 책
          </button>
        </div>
      </nav>

      {/* ── MAIN 3-COLUMN LAYOUT ── */}
      <main className="flex-1 flex overflow-hidden no-print">

        {/* ── LEFT: Page Navigation ── */}
        <DocumentStructure
          book={currentBook}
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

            {/* Right: Paper theme */}
            <div className="flex items-center gap-1.5 shrink-0">
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
              book={currentBook}
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
          book={currentBook}
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
      <PrintSurface book={currentBook} settings={settings} />
    </div>
  );
}


