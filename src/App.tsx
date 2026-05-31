/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Book, Page, PrintSettings, PRESET_PAPER_SIZES } from './types';
import { BOOKS_TEMPLATES } from './bookTemplates';
import Calibration from './components/Calibration';
import BookSpreadReader from './components/BookSpreadReader';
import BookEditor from './components/BookEditor';
import PrintManager from './components/PrintManager';
import PrintSurface from './components/PrintSurface';
import { 
  BookOpen, 
  Printer, 
  Compass, 
  Sliders, 
  Sparkles, 
  Layers, 
  Bookmark, 
  RotateCcw,
  Check,
  Eye,
  Edit2
} from 'lucide-react';

export default function App() {
  // Current active viewport tab: 'reader' | 'printer' | 'calibration'
  const [activeTab, setActiveTab] = useState<'reader' | 'printer' | 'calibration'>('reader');

  // Loaded library catalog
  const [booksList, setBooksList] = useState<Book[]>(BOOKS_TEMPLATES);
  const [selectedBookId, setSelectedBookId] = useState<string>(BOOKS_TEMPLATES[0].id);

  // In-editor interactive state
  const [isEditMode, setIsEditMode] = useState<boolean>(true);

  // Calibration scale state (pixels per physical millimeter)
  // Saved in localStorage to retain monitor calibration settings!
  const [scale, setScale] = useState<number>(() => {
    const saved = localStorage.getItem('prepress-calibration-scale');
    return saved ? parseFloat(saved) : 3.78; // default standard ~96 DPI mapping
  });

  // Global publisher print and page layout settings
  const [settings, setSettings] = useState<PrintSettings>({
    paperSizeId: 'a5',
    margins: {
      top: 22,
      bottom: 22,
      inner: 22, // 제본선 추가 여백
      outer: 18,
    },
    fontFamily: 'Noto Serif KR',
    fontSize: 10,
    lineHeight: 1.65,
    showCropMarks: true,
    showPageNumbers: true,
    showRunningHead: true,
    bleed: 3,
  });

  // Track calibration changes and save to local storage
  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    localStorage.setItem('prepress-calibration-scale', newScale.toString());
  };

  const currentBook = booksList.find((b) => b.id === selectedBookId) || booksList[0];

  // Handler for direct inline editing updates on page content
  const handleUpdatePageText = (pageId: string, text: string) => {
    const updatedPages = currentBook.pages.map((p) =>
      p.id === pageId ? { ...p, content: text } : p
    );
    const updatedBook = { ...currentBook, pages: updatedPages };
    setBooksList(booksList.map((b) => (b.id === currentBook.id ? updatedBook : b)));
  };

  // Handler for full book entity swaps (metadata or full layouts from editor)
  const handleUpdateBook = (updatedBook: Book) => {
    setBooksList(booksList.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
  };

  // Add a new custom booklet template
  const handleCreateNewBook = () => {
    const ts = Date.now();
    const newBook: Book = {
      id: `book-${ts}`,
      title: '새로운 독립출판 단행본',
      author: '지은이 이름',
      subtitle: '아름다운 서지 설명',
      publisher: '내 방 서재 출판',
      coverStyle: 'minimal',
      coverTheme: 'slate',
      pages: [
        {
          id: `p-${ts}-1`,
          layoutType: 'title',
          content: '새로운 책',
        } as Page,
        {
          id: `p-${ts}-2`,
          layoutType: 'body',
          content: '여기에 첫 번째 페이지 내용을 입력해 주세요.\n\n오른쪽 패널에서 본문의 글자 크기, 줄바꿈 여백 등을 실시간으로 조절하고 양면에 최적 배치되는 책을 인쇄해 마주해 보시기 바랍니다.',
        } as Page,
      ],
    };
    setBooksList([...booksList, newBook]);
    setSelectedBookId(newBook.id);
    setIsEditMode(true);
    setActiveTab('reader');
  };

  const selectedSizePreset = PRESET_PAPER_SIZES.find((p) => p.id === settings.paperSizeId) || PRESET_PAPER_SIZES[0];

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans relative">
      
      {/* 1. APP HEADER & MAIN CONTROLS (HIDES AUTOMATICALLY ON MEDIA PRINT) */}
      <nav id="dashboard-header" className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50 shadow-sm no-print">
        
        {/* Brand visual identity with subtle space pairing */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md flex items-center justify-center">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-1.5 uppercase font-sans">
              PRESLY eBook Studio
              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">Pre-Press v1.1</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">실물 크기 1:1 페이징 및 소설/시집 완성형 제판 솔루션</p>
          </div>
        </div>

        {/* Global tab manager selectors */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
          <button
            onClick={() => setActiveTab('reader')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'reader'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen size={14} />
            책 시뮬레이터 (Spread View)
          </button>
          <button
            onClick={() => setActiveTab('printer')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'printer'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer size={14} />
            제각 & 프린트 (Pre-press Grid)
          </button>
          <button
            onClick={() => setActiveTab('calibration')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'calibration'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass size={14} />
            모니터 실물 크기 보정
          </button>
        </div>

        {/* Dynamic primary trigger buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCreateNewBook}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Sparkles size={13} />
            새 책 집필 시작
          </button>

          <button
            onClick={() => {
              setActiveTab('printer');
              setTimeout(() => {
                window.print();
              }, 150);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Printer size={13} />
            인쇄 창 호출
          </button>
        </div>
      </nav>

      {/* 2. MAIN APPLICATION CONTENT AREA (HIDES AUTOMATICALLY ON PRINT) */}
      <main id="screen-dashboard" className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 p-6 md:p-8 max-w-[1700px] w-full mx-auto align-stretch no-print">
        
        {/* LEFT COLUMN: ACTIVE WORKSPACE PREVIEWS */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Active Workpiece Quick metadata strip */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                <Bookmark size={10} className="text-indigo-600" />
                Selected Bookpiece from library
              </div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight flex items-center gap-2">
                {currentBook.title}
                <span className="text-[11px] bg-slate-100 text-slate-500 font-normal px-2.5 py-0.5 rounded-full font-mono">
                  {selectedSizePreset.name}
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">지은이: {currentBook.author} — 발행처: {currentBook.publisher || '독립출판'}</p>
            </div>

            {/* In-app library quick selector */}
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-xs font-bold text-slate-500 hidden md:inline">도서 라이브러리:</span>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-700 hover:bg-slate-100/50 transition-colors"
              >
                {booksList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.author})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC VIEWPORT TAB CONTENT */}
          {activeTab === 'reader' && (
            <div className="space-y-4 animate-fade-in flex flex-col items-center">
              {/* Reader / Editor view modes toggle bar */}
              <div className="w-full flex justify-between items-center bg-slate-100 p-1.5 border border-slate-200/50 rounded-2xl max-w-6xl">
                <span className="text-xs font-medium text-slate-500 ml-3">
                  {isEditMode ? '지면을 마우스로 클릭하여 원고를 가감없이 수정해 보세요.' : '지면을 보며 가볍게 독서하고 레이아웃을 확인하세요.'}
                </span>
                
                <div className="flex bg-white rounded-xl shadow-sm p-0.5 border border-slate-200/40">
                  <button
                    onClick={() => setIsEditMode(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      !isEditMode
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Eye size={12} />
                    완성형 독서 뷰
                  </button>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isEditMode
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Edit2 size={12} />
                    실시간 집필/편집 뷰
                  </button>
                </div>
              </div>

              <BookSpreadReader
                book={currentBook}
                settings={settings}
                scale={scale}
                onUpdatePageText={handleUpdatePageText}
                isEditMode={isEditMode}
              />
            </div>
          )}

          {activeTab === 'printer' && (
            <div className="space-y-4 animate-fade-in">
              <PrintManager
                book={currentBook}
                settings={settings}
                scale={scale}
              />
            </div>
          )}

          {activeTab === 'calibration' && (
            <div className="flex justify-center items-center py-10 animate-fade-in">
              <Calibration
                scale={scale}
                onChangeScale={handleScaleChange}
              />
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: PRE-PRESS PRE-VIEW EDIT AND DESIGN TOOLBOX */}
        <div className="xl:col-span-4 h-full">
          <BookEditor
            book={currentBook}
            settings={settings}
            onChangeSettings={setSettings}
            onUpdateBook={handleUpdateBook}
          />
        </div>

      </main>

      {/* 3. PERSISTENT LOWER AD-MEMORIAL BRAND (HIDES ON PRINT) */}
      <footer className="py-6 border-t border-slate-100 text-center text-xs text-slate-400 no-print flex flex-col gap-1 items-center bg-white mt-auto">
        <p className="font-semibold text-slate-500 font-mono">PRESLY HIGH-FIDELITY PRINTABLE BOOKMAKER</p>
        <p className="font-medium text-slate-400">실제 종이 크기의 비율을 똑같이 계산하여 인쇄소 규격 판형 제판을 지원합니다.</p>
      </footer>

      {/* Actual printable layout (renders outside .no-print elements, so it prints perfectly!) */}
      <PrintSurface book={currentBook} settings={settings} />
    </div>
  );
}
