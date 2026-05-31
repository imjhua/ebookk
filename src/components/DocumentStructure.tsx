/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Book, Page, PageLayoutType } from '../types';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const TYPE_BADGE_LABEL: Record<PageLayoutType, string> = {
  cover:       'COVER',
  toc:         'TOC',
  chapter:     'CHAPTER',
  body:        'BODY',
  quote:       'QUOTE',
  sequence:    'SEQUENCE',
  'title-body':'HEADER-BODY',
  blank:       'BLANK',
  title:       'TITLE',
  poem:        'POEM',
};

const ADD_PAGE_TYPES: { type: PageLayoutType; label: string }[] = [
  { type: 'body',       label: '본문 (BODY)' },
  { type: 'chapter',    label: '챕터 제목 (CHAPTER)' },
  { type: 'quote',      label: '인용구 (QUOTE)' },
  { type: 'toc',        label: '목차 (TOC)' },
  { type: 'sequence',   label: '시퀀스 (SEQUENCE)' },
  { type: 'title-body', label: '제목+본문 (T+B)' },
  { type: 'blank',      label: '빈 페이지 (BLANK)' },
  { type: 'poem',       label: '시 (POEM)' },
];

interface DocumentStructureProps {
  book: Book;
  selectedPageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: (layoutType: PageLayoutType) => void;
  onDeletePage: (pageId: string) => void;
  onUpdatePageTitle?: (pageId: string, title: string) => void;
  onReorderPages: (pages: Page[]) => void;
}

export default function DocumentStructure({
  book,
  selectedPageIndex,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onUpdatePageTitle,
  onReorderPages,
}: DocumentStructureProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragNodeRef = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    dragNodeRef.current = idx;
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== idx) setDragOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    const fromIdx = dragNodeRef.current;
    if (fromIdx === null || fromIdx === dropIdx) return;

    const pages = [...book.pages];
    const [moved] = pages.splice(fromIdx, 1);
    pages.splice(dropIdx, 0, moved);
    onReorderPages(pages);

    // Update selected index to follow the moved page
    if (selectedPageIndex === fromIdx) {
      onSelectPage(dropIdx);
    } else if (fromIdx < dropIdx && selectedPageIndex > fromIdx && selectedPageIndex <= dropIdx) {
      onSelectPage(selectedPageIndex - 1);
    } else if (fromIdx > dropIdx && selectedPageIndex >= dropIdx && selectedPageIndex < fromIdx) {
      onSelectPage(selectedPageIndex + 1);
    }

    setDraggedIdx(null);
    setDragOverIdx(null);
    dragNodeRef.current = null;
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
    dragNodeRef.current = null;
  };

  return (
    <div
      className="flex flex-col h-full no-print shrink-0"
      style={{ width: '200px', minWidth: '200px', backgroundColor: '#2A2420' }}
    >
      {/* Header */}
      <div
        className="px-3 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span
          className="text-[9px] font-bold tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.30)' }}
        >
          Pages
        </span>
        <div className="flex items-center gap-0.5 relative">
          <button
            onClick={() => setShowAddMenu((v) => !v)}
            className="p-1 rounded transition-colors cursor-pointer flex items-center gap-1"
            style={{ color: 'rgba(255,255,255,0.5)', backgroundColor: showAddMenu ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            title="현재 페이지 뒤에 페이지 추가"
          >
            <Plus size={13} />
          </button>

          {/* Add page dropdown */}
          {showAddMenu && (
            <div
              className="absolute right-0 top-7 z-50 rounded-xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: '#3D3530', border: '1px solid rgba(255,255,255,0.08)', minWidth: '170px' }}
            >
              <div className="px-3 py-2 text-[9px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                현재 선택 뒤에 추가
              </div>
              {ADD_PAGE_TYPES.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => {
                    onAddPage(type);
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] font-medium transition-colors cursor-pointer"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Page List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {book.pages.map((page, idx) => {
          const isSelected = idx === selectedPageIndex;
          const isHovered = hoveredIdx === idx;
          const isDragging = draggedIdx === idx;
          const isDragOver = dragOverIdx === idx && draggedIdx !== idx;
          const displayTitle = page.title || '(제목없음)';
          const badge = TYPE_BADGE_LABEL[page.layoutType];

          return (
            <div
              key={page.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectPage(idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex items-center gap-2 px-2 py-2.5 cursor-pointer transition-colors select-none group relative"
              style={{
                backgroundColor: isDragging
                  ? 'rgba(255,255,255,0.03)'
                  : isSelected
                  ? '#F5F0E8'
                  : isHovered
                  ? 'rgba(255,255,255,0.05)'
                  : 'transparent',
                opacity: isDragging ? 0.4 : 1,
                borderTop: isDragOver ? '2px solid #B5714A' : '2px solid transparent',
              }}
            >
              {/* Drag handle */}
              <span
                className="shrink-0 cursor-grab active:cursor-grabbing"
                style={{ color: isSelected ? 'rgba(42,36,32,0.3)' : 'rgba(255,255,255,0.15)' }}
              >
                <GripVertical size={12} />
              </span>

              <span
                className="font-mono text-[11px] font-bold shrink-0 w-4 text-center"
                style={{ color: isSelected ? '#2A2420' : 'rgba(255,255,255,0.25)' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>

              {isSelected && page.layoutType !== 'body' ? (
                <input
                  type="text"
                  value={page.title || ''}
                  onChange={(e) => onUpdatePageTitle?.(page.id, e.target.value)}
                  placeholder="제목 입력..."
                  className="flex-1 bg-transparent outline-none min-w-0 text-[11px] font-medium"
                  style={{ color: '#2A2420' }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="flex-1 text-[11px] font-medium truncate"
                  style={{ color: isSelected ? '#2A2420' : 'rgba(255,255,255,0.55)' }}
                >
                  {displayTitle}
                </span>
              )}

              {isHovered && !isSelected && book.pages.length > 1 ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }}
                  className="shrink-0 cursor-pointer transition-colors"
                  style={{ color: 'rgba(255,80,80,0.7)' }}
                  title="페이지 삭제"
                >
                  <Trash2 size={10} />
                </button>
              ) : (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm shrink-0"
                  style={{
                    backgroundColor: isSelected ? 'rgba(42,36,32,0.08)' : 'rgba(255,255,255,0.07)',
                    color: isSelected ? '#7A6F66' : 'rgba(255,255,255,0.32)',
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
