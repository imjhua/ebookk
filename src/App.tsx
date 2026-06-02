/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Book, Page, PageLayoutType, PrintSettings, BookProject } from './types';
import { useEbookSheet } from './hooks/useEbookSheet';
import { useUndoRedo } from './hooks/useUndoRedo';
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
  LayoutGrid,
  SunDim,
  Download,
  Upload,
} from 'lucide-react';
import BookSpreadReader, { PaperTheme } from './components/BookSpreadReader';

  
const GAS_URL = `
https://script.google.com/macros/s/AKfycbzl24SAZOrIiSqMuNbVE6vsQKmr4uxIg2tkrJ33Lm2GtT6Wo1TWFFJrDVXA9ZwzfHbs/exec
`;

export default function App() {
  const [book, setBook] = useState<Book | null>(null);

  // Undo/Redo state management for page operations (delete, reorder)
  const undoRedo = useUndoRedo(book);

  // Page navigation state
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [currentPageSpread, setCurrentPageSpread] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'single' | 'double' | 'all'>('double');
  const [paperTheme, setPaperTheme] = useState<PaperTheme>('creamy');

  // Calibration scale (px per mm)
  const [scale, setScale] = useState<number>(() => {
    const saved = localStorage.getItem('prepress-calibration-scale');
    return saved ? parseFloat(saved) : 3;
  });

  // Print settings
  const [settings, setSettings] = useState<PrintSettings>({
    paperSizeId: 'a5',
    margins: { top: 21, bottom: 21, inner: 21, outer: 15 },
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

  const { loading: gasLoading, error: gasError, load, syncAll } = useEbookSheet(GAS_URL);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 앱 시작 시 Google Sheets에서 자동 로드
  useEffect(() => {
    (async () => {
      const result = await load();
      console.log('📋 load() 반환값:', result);
      
      // result 구조 확인
      if (!result) {
        console.error('❌ load() 함수가 null을 반환했습니다.');
        setIsInitialLoading(false);
        return;
      }
      
      // pages 배열 확인
      const pages = result.pages || [];
      console.log(`📊 pages 갯수: ${pages.length}`);
      if (pages.length > 0) {
        console.log('📄 첫 번째 페이지 구조:', JSON.stringify(pages[0], null, 2));
      }
      
      if (pages && pages.length > 0) {
        console.log(`✅ 로드 성공: ${pages.length}개 페이지`);
        // Set book with title, author, theme, and pages
        setBook({
          id: 'loaded-book',
          title: result.title || '제목 없음',
          author: result.author || '',
          theme: result.theme || 'classic',
          pages: pages,
        });
        
        // Clear undo/redo history on initial load
        undoRedo.clear();
        
        // Set settings with print/format configuration
        setSettings({
          paperSizeId: result.paperSize || 'a5',
          margins: result.margins || { top: 21, bottom: 21, inner: 21, outer: 15 },
          fontFamily: result.fontFamily || 'Noto Serif KR',
          fontSize: result.fontSize || 10,
          lineHeight: result.lineHeight || 1.65,
          showCropMarks: result.showCropMarks ?? true,
          showPageNumbers: result.showPageNumbers ?? true,
          showRunningHead: result.showRunningHead ?? true,
          bleed: result.bleed || 3,
          pageTypeVisibility: result.pageTypeVisibility,
        });
      } else {
        console.error(`❌ pages 배열이 비어있습니다 (길이: ${pages?.length || 0})`);
      }
      
      setIsInitialLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = book?.pages?.length || 0;

  // ── Page selection (syncs spread) ──
  const handleSelectPage = (index: number) => {
    setSelectedPageIndex(index);
    setCurrentPageSpread(viewMode === 'double' ? Math.floor(index / 2) * 2 : index);
  };

  // ── View mode toggle ──
  const handleViewModeChange = (mode: 'single' | 'double' | 'all') => {
    setViewMode(mode);
    if (mode !== 'all') {
      setCurrentPageSpread(mode === 'double' ? Math.floor(currentPageSpread / 2) * 2 : currentPageSpread);
    }
  };

  // ── All mode: page click → navigate + switch to double ──
  const handlePageClickInAllMode = (pageIndex: number) => {
    handleSelectPage(pageIndex);
    handleViewModeChange('double');
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
    if (!book) return;
    const updatedPages = book.pages.map((p) =>
      p.id === pageId ? { ...p, content: text } : p
    );
    handleUpdateBook({ ...book, pages: updatedPages });
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setBook(updatedBook);
  };

  const handleUpdatePageMeta = (pageId: string, updates: Partial<Pick<Page, 'title' | 'content'>>) => {
    if (!book) return;
    const updatedPages = book.pages.map((p) =>
      p.id === pageId ? { ...p, ...updates } : p
    );
    handleUpdateBook({ ...book, pages: updatedPages });
  };

  const handleUpdatePageTitle = (pageId: string, title: string) => {
    handleUpdatePageMeta(pageId, { title });
  };

  const handleUpdatePageType = (pageId: string, layoutType: PageLayoutType) => {
    if (!book) return;
    const updatedPages = book.pages.map((p) =>
      p.id === pageId ? { ...p, layoutType } : p
    );
    handleUpdateBook({ ...book, pages: updatedPages });
  };

  // Insert page AFTER current selection
  const handleAddPage = (layoutType: PageLayoutType) => {
    if (!book) return;
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
    if (!book) return;
    // Push current state to undo history before deletion
    undoRedo.pushState(book);
    
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
    if (!book) return;
    // Push current state to undo history before reordering
    undoRedo.pushState(book);
    handleUpdateBook({ ...book, pages });
  };

  const handleUndo = () => {
    const previousBook = undoRedo.undo();
    if (previousBook) {
      setBook(previousBook);
    }
  };

  const handleRedo = () => {
    const nextBook = undoRedo.redo();
    if (nextBook) {
      setBook(nextBook);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToSheets = async () => {
    if (!book) {
      console.error('❌ 저장할 책 데이터가 없습니다');
      return;
    }
    
    // Construct complete BookProject from current state
    const project: BookProject = {
      title: book.title,
      author: book.author,
      theme: book.theme,
      paperSize: settings.paperSizeId, // Convert from paperSizeId to paperSize
      margins: settings.margins,
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      showCropMarks: settings.showCropMarks,
      showPageNumbers: settings.showPageNumbers,
      showRunningHead: settings.showRunningHead,
      bleed: settings.bleed,
      pageTypeVisibility: settings.pageTypeVisibility,
      pages: book.pages,
    };
    
    try {
      await syncAll(project);
      console.log('✅ 전체 프로젝트 저장 완료');
    } catch (err) {
      console.error('❌ 저장 실패:', err);
    }
  };

  const handleLoadFromSheets = async () => {
    try {
      const result = await load();
      if (result && result.pages && result.pages.length > 0) {
        setBook({
          id: 'loaded-book',
          title: result.title || '제목 없음',
          author: result.author || '',
          theme: result.theme || 'classic',
          pages: result.pages,
        });
        
        // Also load settings from the project
        setSettings({
          paperSizeId: result.paperSize || 'a5',
          margins: result.margins || { top: 21, bottom: 21, inner: 21, outer: 15 },
          fontFamily: result.fontFamily || 'Noto Serif KR',
          fontSize: result.fontSize || 10,
          lineHeight: result.lineHeight || 1.65,
          showCropMarks: result.showCropMarks ?? true,
          showPageNumbers: result.showPageNumbers ?? true,
          showRunningHead: result.showRunningHead ?? true,
          bleed: result.bleed || 3,
          pageTypeVisibility: result.pageTypeVisibility,
        });
        
        setSelectedPageIndex(0);
        setCurrentPageSpread(0);
      } else {
        throw new Error('GAS에서 데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('Failed to load from sheets:', err);
    }
  };

  const handleDownloadProject = () => {
    if (!book) {
      console.error('❌ 다운로드할 책 데이터가 없습니다');
      return;
    }

    // Create project data
    const projectData = {
      title: book.title,
      author: book.author,
      theme: book.theme,
      paperSize: settings.paperSizeId,
      margins: settings.margins,
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      showCropMarks: settings.showCropMarks,
      showPageNumbers: settings.showPageNumbers,
      showRunningHead: settings.showRunningHead,
      bleed: settings.bleed,
      pageTypeVisibility: settings.pageTypeVisibility,
      pages: book.pages,
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(projectData, null, 2);

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.title || 'project'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ 프로젝트 다운로드 완료:', link.download);
  };

  const spreadLabel = viewMode === 'all'
    ? `전체 ${totalPages}페이지`
    : viewMode === 'double'
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

      {/* ── ERROR/NO DATA STATE ── */}
      {!isInitialLoading && !book && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5" style={{ backgroundColor: '#2C261F', color: '#FAF6EC' }}>
          <div className="flex flex-col items-center gap-3 max-w-md text-center">
            <span className="text-2xl font-serif font-bold">⚠️ 데이터를 불러올 수 없습니다</span>
            <span className="text-sm font-mono" style={{ color: 'rgba(250,246,236,0.7)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {gasError || ''}
            </span>
            <button
              onClick={handleLoadFromSheets}
              disabled={gasLoading}
              className="mt-4 px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              style={{
                backgroundColor: gasLoading ? '#5A5A5A' : '#B5714A',
                color: '#FDFAF6',
                opacity: gasLoading ? 0.6 : 1,
                cursor: gasLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {gasLoading ? '로딩 중...' : '다시 시도'}
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN 3-COLUMN LAYOUT (+ error banner if needed) ── */}
      {!isInitialLoading && book && (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Error Banner (if GAS load failed but showing default data) */}
        {gasError && (
          <div
            className="shrink-0 px-4 py-2 text-sm flex items-center justify-between"
            style={{ backgroundColor: '#FDF3E6', borderBottom: '1px solid #E8D4B8', color: '#8B6914' }}
          >
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span className="font-semibold">Google Sheets 데이터를 로드할 수 없어 기본값을 표시하고 있습니다</span>
            </span>
            <button
              onClick={handleLoadFromSheets}
              disabled={gasLoading}
              className="px-2 py-1 rounded text-xs font-semibold transition-colors"
              style={{
                backgroundColor: gasLoading ? '#D4C4B0' : '#B5714A',
                color: '#FDFAF6',
                opacity: gasLoading ? 0.6 : 1,
                cursor: gasLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {gasLoading ? '로딩 중...' : '다시 시도'}
            </button>
          </div>
        )}
        
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
          onUpdatePageType={handleUpdatePageType}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoRedo.canUndo}
          canRedo={undoRedo.canRedo}
        />

        {/* ── CENTER: Book View ── */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#F5F0E8' }}>

          {/* Book Metadata Header */}
          <div
            className="shrink-0 px-4 py-2 flex items-center justify-between"
            style={{ backgroundColor: '#F5F0E8', borderBottom: '1px solid #E8E0D4' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold" style={{ color: '#B4A99E' }}>📘 책:</span>
              <span className="text-[11px] font-bold" style={{ color: '#2A2420' }}>{book.title}</span>
              <span className="text-[10px]" style={{ color: '#7A6F66' }}>• 테마: {book.theme}</span>
            </div>
          </div>

          {/* Center Toolbar */}
          <div
            className="shrink-0 flex items-center justify-between px-4 py-2 gap-3"
            style={{ backgroundColor: '#FDFAF6', borderBottom: '1px solid #E8E0D4' }}
          >
            {/* Left: View mode + navigation */}
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
                <button
                  onClick={() => handleViewModeChange('all')}
                  title="전체 보기"
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors"
                  style={{ backgroundColor: viewMode === 'all' ? '#2A2420' : '#FDFAF6', color: viewMode === 'all' ? '#fff' : '#7A6F66' }}
                >
                  <LayoutGrid size={12} /> 전체
                </button>
              </div>

              {/* Navigation */}
              {viewMode !== 'all' && (
                <>
                  <button
                    onClick={handlePrevSpread}
                    disabled={isAtStart}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#FDFAF6', border: '1px solid #E8E0D4', color: '#2A2420' }}
                  >
                    <ChevronLeft size={13} /> 이전
                  </button>
                </>
              )}
              <span
                className="text-[11px] font-semibold font-mono px-2.5 py-1.5 rounded-lg select-none shrink-0"
                style={{ backgroundColor: '#F5F0E8', color: '#7A6F66', border: '1px solid #E8E0D4' }}
              >
                {spreadLabel}
              </span>
              {viewMode !== 'all' && (
                <button
                  onClick={handleNextSpread}
                  disabled={isAtEnd}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FDFAF6', border: '1px solid #E8E0D4', color: '#2A2420' }}
                >
                  다음 <ChevronRight size={13} />
                </button>
              )}
            </div>

            {/* Right: GAS + Paper theme */}
            <div className="flex items-center gap-2 shrink-0">
              {/* GAS Save / Load */}
              <div className="flex items-center gap-0 rounded-lg overflow-hidden" style={{ border: '1px solid #E8E0D4' }}>
                <button
                  onClick={handleLoadFromSheets}
                  disabled={gasLoading}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FDFAF6', color: '#7A6F66' }}
                  title="Google Sheets에서 불러오기"
                >
                  <Download size={12} />
                  {gasLoading ? '로딩중…' : '불러오기'}
                </button>
                <div style={{ width: 1, height: 16, backgroundColor: '#E8E0D4', flexShrink: 0 }} />
                <button
                  onClick={handleSaveToSheets}
                  disabled={gasLoading}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: gasLoading ? '#7A4F30' : '#B5714A',
                    color: '#fff',
                  }}
                  title="Google Sheets에 저장"
                >
                  <Upload size={12} />
                  {gasLoading ? '저장중…' : '저장'}
                </button>
              </div>
              {gasError && (
                <span
                  className="text-[10px] font-medium max-w-[100px] truncate shrink-0"
                  style={{ color: '#C0392B' }}
                  title={gasError}
                >
                  {gasError}
                </span>
              )}
              <div className="shrink-0" style={{ width: 1, height: 16, backgroundColor: '#E8E0D4' }} />
              <button
                onClick={handleDownloadProject}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors rounded-lg"
                style={{
                  backgroundColor: '#E8D5C4',
                  color: '#2A2420',
                }}
                title="프로젝트를 JSON 파일로 다운로드"
              >
                <Download size={12} />
                다운로드
              </button>
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
              viewMode={viewMode}
              currentPageSpread={currentPageSpread}
              paperTheme={paperTheme}
              onPageClick={handlePageClickInAllMode}
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
      </div>
      )}

      {/* Printable DOM (hidden on screen) */}
      {book && <PrintSurface book={book} settings={settings} paperTheme={paperTheme} />}
    </div>
  );
}


