/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Book, Page, PageLayoutType, PrintSettings, Margins, PRESET_PAPER_SIZES } from '../types';
import { Trash2, Plus, Settings, Layout, FileText } from 'lucide-react';

const LAYOUT_TYPES: { type: PageLayoutType; label: string; desc: string; icon: string }[] = [
  { type: 'body',  label: '본문',      desc: '일반 본문 텍스트',        icon: '¶' },
  { type: 'title', label: '제목',      desc: '섹션 제목 페이지',        icon: 'T' },
  { type: 'poem',  label: '시',        desc: '넓은 여백의 시 레이아웃', icon: '✦' },
  { type: 'quote', label: '인용구',    desc: '강조 인용구 중앙 배치',   icon: '"' },
  { type: 'blank', label: '빈 페이지', desc: '완전히 비어있는 페이지',  icon: '○' },
];

const LAYOUT_BADGE: Record<PageLayoutType, string> = {
  body:  'bg-slate-100 text-slate-600',
  title: 'bg-indigo-100 text-indigo-700',
  poem:  'bg-emerald-100 text-emerald-700',
  quote: 'bg-amber-100 text-amber-700',
  blank: 'bg-slate-50 text-slate-400 border border-slate-200',
};

interface BookEditorProps {
  book: Book;
  settings: PrintSettings;
  onChangeSettings: (newSettings: PrintSettings) => void;
  onUpdateBook: (updatedBook: Book) => void;
}

export default function BookEditor({ book, settings, onChangeSettings, onUpdateBook }: BookEditorProps) {
  const [activeTab, setActiveTab] = useState<'format' | 'meta'>('format');
  const [selectedLayoutType, setSelectedLayoutType] = useState<PageLayoutType>('body');
  const paperSize = PRESET_PAPER_SIZES.find((p) => p.id === settings.paperSizeId) || PRESET_PAPER_SIZES[0];

  const handleMarginChange = (key: keyof Margins, value: number) => {
    onChangeSettings({ ...settings, margins: { ...settings.margins, [key]: value } });
  };

  const handleAddPage = () => {
    const newPage: Page = { id: `p-${Date.now()}`, layoutType: selectedLayoutType, content: '' };
    onUpdateBook({ ...book, pages: [...book.pages, newPage] });
  };

  const handleDeletePage = (pageId: string) => {
    if (book.pages.length <= 1) { alert('최소 1페이지는 보존해야 합니다.'); return; }
    onUpdateBook({ ...book, pages: book.pages.filter((p) => p.id !== pageId) });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-100 bg-slate-50/50">
        <button
          onClick={() => setActiveTab('format')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'format' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layout size={14} />
          여백 및 서체
        </button>
        <button
          onClick={() => setActiveTab('meta')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'meta' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings size={14} />
          책 정보 및 커버
        </button>
      </div>

      <div className="p-6 flex-1 overflow-auto space-y-6 scrollbar-thin">

        {/* ─── FORMAT TAB ─── */}
        {activeTab === 'format' && (
          <div className="space-y-6">

            {/* Paper Size */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. 책 규격 (판형)
              </label>
              <select
                value={settings.paperSizeId}
                onChange={(e) => onChangeSettings({ ...settings, paperSizeId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer hover:bg-slate-100/50 transition-colors"
              >
                {PRESET_PAPER_SIZES.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name} ({size.width}×{size.height}mm)
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{paperSize.description}</p>
            </div>

            {/* Margins */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                2. 여백 (mm)
              </label>
              <div className="grid grid-cols-2 gap-4">
                {(['top', 'bottom', 'inner', 'outer'] as const).map((key) => {
                  const labels = {
                    top: '상단 여백',
                    bottom: '하단 여백',
                    inner: '제본 여백 (안쪽)',
                    outer: '바깥 여백',
                  };
                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-semibold text-slate-600">{labels[key]}</span>
                        <span className="text-[11px] text-indigo-600 font-mono font-bold">{settings.margins[key]}mm</span>
                      </div>
                      <input
                        type="range" min="10" max="40"
                        value={settings.margins[key]}
                        onChange={(e) => handleMarginChange(key, parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-ew-resize accent-indigo-600"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Typography */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. 타이포그래피
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">서체</span>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) => onChangeSettings({ ...settings, fontFamily: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="Noto Serif KR">나눔/노토 명조체</option>
                    <option value="Playfair Display">클래식 세리프</option>
                    <option value="Inter">인터 산스</option>
                    <option value="Fira Code">코딩 고딕</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">본문 크기</span>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => onChangeSettings({ ...settings, fontSize: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="9">9pt (소형 시집)</option>
                    <option value="10">10pt (표준 소설)</option>
                    <option value="10.5">10.5pt (단행본)</option>
                    <option value="11">11pt (학술/논문)</option>
                    <option value="12">12pt (큰 글씨)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-slate-600">행간</span>
                  <span className="text-[11px] text-indigo-600 font-mono font-bold">{settings.lineHeight}배</span>
                </div>
                <input
                  type="range" min="1.4" max="2.2" step="0.05"
                  value={settings.lineHeight}
                  onChange={(e) => onChangeSettings({ ...settings, lineHeight: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-ew-resize accent-indigo-600"
                />
              </div>
            </div>

            {/* Print Elements */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                4. 인쇄 요소
              </label>
              {[
                { key: 'showPageNumbers', label: '쪽번호 (Page Numbers)' },
                { key: 'showRunningHead', label: '러닝헤드 (Header Titles)' },
                { key: 'showCropMarks',   label: '재단선 (Crop Marks 3mm)' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs font-medium text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={(settings as any)[key]}
                    onChange={(e) => onChangeSettings({ ...settings, [key]: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  {label}
                </label>
              ))}
            </div>

          </div>
        )}

        {/* ─── META TAB ─── */}
        {activeTab === 'meta' && (
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">도서 서지정보</h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500">제목</span>
                <input
                  type="text" value={book.title}
                  onChange={(e) => onUpdateBook({ ...book, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="제목 입력"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">작가명</span>
                  <input
                    type="text" value={book.author}
                    onChange={(e) => onUpdateBook({ ...book, author: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="지은이"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">출판사</span>
                  <input
                    type="text" value={book.publisher || ''}
                    onChange={(e) => onUpdateBook({ ...book, publisher: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="출판 소속"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500">부제목</span>
                <input
                  type="text" value={book.subtitle || ''}
                  onChange={(e) => onUpdateBook({ ...book, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="부제목"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">표지 스타일</h4>
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-slate-500 block">커버 디자인</span>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: 'minimal',   name: '미니멀' },
                    { id: 'classic',   name: '클래식' },
                    { id: 'modern',    name: '모던' },
                    { id: 'editorial', name: '에디토리얼' },
                  ] as const).map((style) => (
                    <button
                      key={style.id}
                      onClick={() => onUpdateBook({ ...book, coverStyle: style.id })}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left cursor-pointer transition-all ${
                        book.coverStyle === style.id
                          ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700'
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100/50'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-slate-500 block">커버 색상</span>
                <div className="flex flex-wrap gap-2.5">
                  {(['slate', 'navy', 'forest', 'terracotta', 'parchment', 'gold'] as const).map((theme) => {
                    const colors: Record<string, string> = {
                      slate:     'bg-slate-600 border-slate-500',
                      navy:      'bg-[#1E293B] border-[#0F172A]',
                      forest:    'bg-[#14532D] border-[#166534]',
                      terracotta:'bg-[#7C2D12] border-[#9A3412]',
                      parchment: 'bg-[#FCFAF2] border-stone-300',
                      gold:      'bg-[#451A03] border-amber-800',
                    };
                    return (
                      <button
                        key={theme}
                        onClick={() => onUpdateBook({ ...book, coverTheme: theme })}
                        className={`w-8 h-8 rounded-full border cursor-pointer transition-all ${colors[theme]} ${
                          book.coverTheme === theme ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'
                        }`}
                        title={theme}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ─── PAGE MANAGER (always visible) ─── */}
      <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col gap-3 shrink-0">

        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            페이지 목록 ({book.pages.length}p)
          </span>
        </div>

        {/* Layout Type Selector + Add Button */}
        <div className="flex gap-1.5 flex-wrap items-center">
          {LAYOUT_TYPES.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => setSelectedLayoutType(type)}
              title={LAYOUT_TYPES.find((l) => l.type === type)?.desc}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer transition-all ${
                selectedLayoutType === type
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <span className="font-mono text-[10px]">{icon}</span>
              {label}
            </button>
          ))}
          <button
            onClick={handleAddPage}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all ml-auto"
          >
            <Plus size={11} />
            추가
          </button>
        </div>

        {/* Pages List */}
        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
          {book.pages.map((page, idx) => (
            <div
              key={page.id}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm flex-shrink-0"
            >
              <FileText size={11} className="text-slate-400" />
              <span className="font-mono font-semibold text-[11px] text-slate-700">{idx + 1}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${LAYOUT_BADGE[page.layoutType]}`}>
                {LAYOUT_TYPES.find((l) => l.type === page.layoutType)?.label}
              </span>
              <button
                onClick={() => handleDeletePage(page.id)}
                className="ml-0.5 text-slate-300 hover:text-rose-500 cursor-pointer transition-colors"
                title="페이지 삭제"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
