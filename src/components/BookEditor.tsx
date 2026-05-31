/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Book, BookTheme, Page, PageLayoutType, PrintSettings, Margins, PRESET_PAPER_SIZES, TocEntry } from '../types';
import { Printer, FileText, Ruler, BookOpen, Compass, Plus, Trash2 } from 'lucide-react';
import Calibration from './Calibration';

const THEME_BUTTONS: { id: BookTheme; label: string }[] = [
  { id: 'classic',  label: 'CLASSIC' },
  { id: 'modern',   label: 'MODERN' },
  { id: 'academic', label: 'ACADEMIC' },
  { id: 'zen',      label: 'ZEN' },
];

type SubTab = 'page' | 'format' | 'meta' | 'calibration';

interface BookEditorProps {
  book: Book;
  settings: PrintSettings;
  selectedPageIndex: number;
  scale: number;
  onChangeSettings: (newSettings: PrintSettings) => void;
  onUpdateBook: (updatedBook: Book) => void;
  onUpdatePageMeta: (pageId: string, updates: Partial<Pick<Page, 'title' | 'content'>>) => void;
  onChangeScale: (scale: number) => void;
  onPrint: () => void;
}

export default function BookEditor({
  book,
  settings,
  selectedPageIndex,
  scale,
  onChangeSettings,
  onUpdateBook,
  onUpdatePageMeta,
  onChangeScale,
  onPrint,
}: BookEditorProps) {
  const [subTab, setSubTab] = useState<SubTab>('page');

  const currentPage = book.pages[selectedPageIndex] as Page | undefined;
  const paperSize   = PRESET_PAPER_SIZES.find((p) => p.id === settings.paperSizeId) || PRESET_PAPER_SIZES[0];

  const handleMarginChange = (key: keyof Margins, value: number) => {
    onChangeSettings({ ...settings, margins: { ...settings.margins, [key]: value } });
  };

  const PAGE_TYPE_LABEL: Record<PageLayoutType, string> = {
    cover:       'cover',
    toc:         'toc',
    chapter:     'chapter',
    body:        'body',
    quote:       'quote',
    sequence:    'sequence',
    'title-body':'title-body',
    blank:       'blank',
    title:       'title',
    poem:        'poem',
  };

  return (
    <div
      className="flex flex-col h-full no-print shrink-0 overflow-hidden"
      style={{ width: '280px', minWidth: '280px', backgroundColor: '#FDFAF6', borderLeft: '1px solid #E8E0D4' }}
    >
      {/* ── PRINT BUTTON ── */}
      <div className="px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid #E8E0D4' }}>
        <button
          onClick={onPrint}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#B5714A' }}
        >
          <Printer size={14} />
          인쇄 출력
        </button>
      </div>

      {/* ── BOOK THEME ── */}
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid #E8E0D4' }}>
        <p className="text-[10px] font-bold mb-2" style={{ color: '#B4A99E' }}>BOOK THEME</p>
        <div className="grid grid-cols-4 gap-1">
          {THEME_BUTTONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onUpdateBook({ ...book, theme: id })}
              className="py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
              style={{
                backgroundColor: book.theme === id ? '#2A2420' : '#F5F0E8',
                color:           book.theme === id ? '#F5F0E8'  : '#7A6F66',
                border:          book.theme === id ? '1px solid #2A2420' : '1px solid #E8E0D4',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SUB TABS ── */}
      <div className="flex shrink-0" style={{ borderBottom: '1px solid #E8E0D4', backgroundColor: '#F5F0E8' }}>
        {([
          { id: 'page'        as SubTab, Icon: FileText, label: '페이지' },
          { id: 'format'      as SubTab, Icon: Ruler,    label: '서식' },
          { id: 'meta'        as SubTab, Icon: BookOpen, label: '정보' },
          { id: 'calibration' as SubTab, Icon: Compass,  label: '보정' },
        ] as const).map(({ id, Icon, label }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            title={label}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 cursor-pointer transition-colors text-[9px] font-bold"
            style={{
              borderBottom: subTab === id ? '2px solid #B5714A' : '2px solid transparent',
              color:         subTab === id ? '#B5714A'           : '#B4A99E',
              backgroundColor: subTab === id ? '#FDFAF6' : 'transparent',
            }}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">

        {/* ── PAGE EDIT ── */}
        {subTab === 'page' && (
          <div className="px-4 py-4 space-y-4">
            {currentPage ? (
              <>
                <div>
                  <span className="text-[10px] font-bold" style={{ color: '#B4A99E' }}>현재 페이지 타입</span>
                  <p className="mt-0.5 text-[13px] font-bold" style={{ color: '#B5714A' }}>
                    {PAGE_TYPE_LABEL[currentPage.layoutType]}
                  </p>
                </div>

                {currentPage.layoutType === 'cover' && (
                  <div className="space-y-3">
                    <FieldInput label="첫 제목"   value={book.title}           onChange={(v) => onUpdateBook({ ...book, title: v })}    placeholder="책 제목 입력" />
                    <FieldInput label="서브타이틀" value={book.subtitle || ''}  onChange={(v) => onUpdateBook({ ...book, subtitle: v })} placeholder="부제목 입력" />
                    <FieldInput label="저자명"     value={book.author}          onChange={(v) => onUpdateBook({ ...book, author: v })}   placeholder="작가명 입력" />
                  </div>
                )}

                {currentPage.layoutType === 'chapter' && (
                  <div className="space-y-3">
                    <FieldInput label="챕터 제목" value={currentPage.title || ''} onChange={(v) => onUpdatePageMeta(currentPage.id, { title: v })}   placeholder="예: CHAPTER 01" />
                    <FieldInput label="챕터 부제" value={currentPage.content}     onChange={(v) => onUpdatePageMeta(currentPage.id, { content: v })} placeholder="챕터 소개 문구 (선택)" />
                  </div>
                )}

                {currentPage.layoutType === 'toc' && (() => {
                  let entries: TocEntry[] = [];
                  try { entries = JSON.parse(currentPage.content); } catch { entries = []; }
                  const updateEntries = (next: TocEntry[]) =>
                    onUpdatePageMeta(currentPage.id, { content: JSON.stringify(next) });
                  return (
                    <div className="space-y-3">
                      <FieldInput
                        label="목차 제목"
                        value={currentPage.title || ''}
                        onChange={(v) => onUpdatePageMeta(currentPage.id, { title: v })}
                        placeholder="예: 목차"
                      />
                      <div>
                        <span className="block text-[10px] font-semibold mb-2" style={{ color: '#B4A99E' }}>목차 항목</span>
                        <div className="space-y-2">
                          {entries.map((entry, i) => (
                            <div key={i} className="rounded-xl p-3 space-y-2" style={{ backgroundColor: '#F5F0E8', border: '1px solid #E8E0D4' }}>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-[9px] font-bold block mb-1" style={{ color: '#B4A99E' }}>CHAPTER</span>
                                  <input
                                    type="text"
                                    value={entry.chapter}
                                    onChange={(e) => {
                                      const next = [...entries];
                                      next[i] = { ...next[i], chapter: e.target.value };
                                      updateEntries(next);
                                    }}
                                    className="w-full text-[10px] px-2 py-1 rounded-md outline-none"
                                    style={{ backgroundColor: '#fff', border: '1px solid #E8E0D4', color: '#2A2420', fontFamily: 'inherit' }}
                                  />
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold block mb-1" style={{ color: '#B4A99E' }}>PAGE #</span>
                                  <input
                                    type="number"
                                    value={entry.pageNum}
                                    onChange={(e) => {
                                      const next = [...entries];
                                      next[i] = { ...next[i], pageNum: parseInt(e.target.value) || 0 };
                                      updateEntries(next);
                                    }}
                                    className="w-full text-[10px] px-2 py-1 rounded-md outline-none"
                                    style={{ backgroundColor: '#fff', border: '1px solid #E8E0D4', color: '#2A2420', fontFamily: 'inherit' }}
                                  />
                                </div>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold block mb-1" style={{ color: '#B4A99E' }}>TITLE</span>
                                <div className="flex gap-1.5">
                                  <input
                                    type="text"
                                    value={entry.title}
                                    onChange={(e) => {
                                      const next = [...entries];
                                      next[i] = { ...next[i], title: e.target.value };
                                      updateEntries(next);
                                    }}
                                    className="flex-1 text-[10px] px-2 py-1 rounded-md outline-none"
                                    style={{ backgroundColor: '#fff', border: '1px solid #E8E0D4', color: '#2A2420', fontFamily: 'inherit' }}
                                  />
                                  <button
                                    onClick={() => updateEntries(entries.filter((_, j) => j !== i))}
                                    className="px-2 py-1 rounded-md flex items-center justify-center"
                                    style={{ backgroundColor: '#FFE8E8', color: '#C0392B' }}
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => updateEntries([
                              ...entries,
                              { chapter: `Chapter ${String(entries.length + 1).padStart(2, '0')}`, pageNum: 0, title: '' },
                            ])}
                            className="w-full py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5"
                            style={{ backgroundColor: '#F5F0E8', border: '1px dashed #D0C8BE', color: '#7A6F66' }}
                          >
                            <Plus size={12} /> 항목 추가
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {['body', 'quote', 'sequence', 'title-body'].includes(currentPage.layoutType) && (
                  <div className="rounded-xl px-3 py-3 text-[11px]" style={{ backgroundColor: '#F5F0E8', color: '#B4A99E' }}>
                    지면을 직접 클릭하여 본문을 편집하세요.
                  </div>
                )}
              </>
            ) : (
              <p className="text-[11px]" style={{ color: '#aaa' }}>선택된 페이지 없음</p>
            )}
          </div>
        )}

        {/* ── FORMAT ── */}
        {subTab === 'format' && (
          <div className="px-4 py-4 space-y-5">
            <div>
              <label className="block text-[10px] font-bold mb-1.5" style={{ color: '#B4A99E' }}>책 규격 (판형)</label>
              <select
                value={settings.paperSizeId}
                onChange={(e) => onChangeSettings({ ...settings, paperSizeId: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-[11px] font-semibold cursor-pointer outline-none"
                style={{ backgroundColor: '#F5F0E8', border: '1px solid #E8E0D4', color: '#2A2420' }}
              >
                {PRESET_PAPER_SIZES.map((size) => (
                  <option key={size.id} value={size.id}>{size.name} ({size.width}×{size.height}mm)</option>
                ))}
              </select>
              <p className="text-[9px] mt-1" style={{ color: '#C4B8AE' }}>{paperSize.description}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold mb-2" style={{ color: '#B4A99E' }}>여백 (mm)</label>
              <div className="space-y-3">
                {(['top', 'bottom', 'inner', 'outer'] as const).map((key) => {
                  const labels = { top: '상단', bottom: '하단', inner: '제본(안쪽)', outer: '바깥' };
                  return (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px]" style={{ color: '#7A6F66' }}>{labels[key]}</span>
                        <span className="text-[10px] font-bold font-mono" style={{ color: '#B5714A' }}>{settings.margins[key]}mm</span>
                      </div>
                      <input type="range" min="10" max="40"
                        value={settings.margins[key]}
                        onChange={(e) => handleMarginChange(key, parseInt(e.target.value))}
                        className="w-full h-1 rounded-lg appearance-none cursor-ew-resize"
                        style={{ accentColor: '#B5714A' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E8E0D4', paddingTop: '1.25rem' }}>
              <label className="block text-[10px] font-bold mb-2" style={{ color: '#B4A99E' }}>타이포그래피</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <span className="text-[9px] font-semibold block mb-1" style={{ color: '#C4B8AE' }}>서체</span>
                  <select value={settings.fontFamily}
                    onChange={(e) => onChangeSettings({ ...settings, fontFamily: e.target.value as any })}
                    className="w-full rounded-lg px-2 py-1.5 text-[10px] cursor-pointer outline-none"
                    style={{ backgroundColor: '#F5F0E8', border: '1px solid #E8E0D4', color: '#2A2420' }}
                  >
                    <option value="Noto Serif KR">나눔/노토 명조</option>
                    <option value="Playfair Display">클래식 세리프</option>
                    <option value="Inter">인터 산스</option>
                    <option value="Fira Code">코딩 고딕</option>
                  </select>
                </div>
                <div>
                  <span className="text-[9px] font-semibold block mb-1" style={{ color: '#C4B8AE' }}>본문 크기</span>
                  <select value={settings.fontSize}
                    onChange={(e) => onChangeSettings({ ...settings, fontSize: parseFloat(e.target.value) })}
                    className="w-full rounded-lg px-2 py-1.5 text-[10px] cursor-pointer outline-none"
                    style={{ backgroundColor: '#F5F0E8', border: '1px solid #E8E0D4', color: '#2A2420' }}
                  >
                    <option value="9">9pt (시집)</option>
                    <option value="10">10pt (소설)</option>
                    <option value="10.5">10.5pt (단행본)</option>
                    <option value="11">11pt (학술)</option>
                    <option value="12">12pt (큰 글씨)</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px]" style={{ color: '#7A6F66' }}>행간</span>
                  <span className="text-[10px] font-bold font-mono" style={{ color: '#B5714A' }}>{settings.lineHeight}배</span>
                </div>
                <input type="range" min="1.4" max="2.2" step="0.05"
                  value={settings.lineHeight}
                  onChange={(e) => onChangeSettings({ ...settings, lineHeight: parseFloat(e.target.value) })}
                  className="w-full h-1 rounded-lg appearance-none cursor-ew-resize"
                  style={{ accentColor: '#B5714A' }}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E8E0D4', paddingTop: '1.25rem' }}>
              <label className="block text-[10px] font-bold mb-2" style={{ color: '#B4A99E' }}>인쇄 요소</label>
              {[
                { key: 'showPageNumbers', label: '쪽번호' },
                { key: 'showRunningHead', label: '러닝헤드' },
                { key: 'showCropMarks',   label: '재단선 (3mm)' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2.5 py-2 cursor-pointer select-none text-[11px]" style={{ color: '#7A6F66' }}>
                  <input type="checkbox"
                    checked={(settings as any)[key]}
                    onChange={(e) => onChangeSettings({ ...settings, [key]: e.target.checked })}
                    className="w-3.5 h-3.5 rounded cursor-pointer"
                    style={{ accentColor: '#B5714A' }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── META ── */}
        {subTab === 'meta' && (
          <div className="px-4 py-4 space-y-3">
            <label className="block text-[10px] font-bold" style={{ color: '#B4A99E' }}>도서 서지정보</label>
            <FieldInput label="제목"   value={book.title}           onChange={(v) => onUpdateBook({ ...book, title: v })}     placeholder="제목 입력" />
            <div className="grid grid-cols-2 gap-2">
              <FieldInput label="작가명" value={book.author}          onChange={(v) => onUpdateBook({ ...book, author: v })}    placeholder="지은이" />
              <FieldInput label="출판사" value={book.publisher || ''} onChange={(v) => onUpdateBook({ ...book, publisher: v })} placeholder="출판사" />
            </div>
            <FieldInput label="부제목" value={book.subtitle || ''}  onChange={(v) => onUpdateBook({ ...book, subtitle: v })}  placeholder="부제목" />
          </div>
        )}

        {/* ── CALIBRATION ── */}
        {subTab === 'calibration' && (
          <div className="px-3 py-4">
            <Calibration scale={scale} onChangeScale={onChangeScale} />
          </div>
        )}

      </div>
    </div>
  );
}

function FieldInput({
  label, value, onChange, placeholder, multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const sharedStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#F5F0E8',
    border: '1px solid #E8E0D4',
    borderRadius: '8px',
    padding: '7px 10px',
    fontSize: '11px',
    color: '#2A2420',
    outline: 'none',
    resize: multiline ? 'vertical' : 'none',
    fontFamily: 'inherit',
  };
  return (
    <div>
      <span className="block text-[10px] font-semibold mb-1" style={{ color: '#B4A99E' }}>{label}</span>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} style={sharedStyle} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={sharedStyle} />
      }
    </div>
  );
}
