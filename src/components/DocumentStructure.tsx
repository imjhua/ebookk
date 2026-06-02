/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Book, Page, PageLayoutType } from '../types';
import { Plus, Trash2, RotateCcw, RotateCw } from 'lucide-react';

const TYPE_BADGE_LABEL: Record<PageLayoutType, string> = {
  cover:       'COVER',
  toc:         'TOC',
  chapter:     'CHAPTER',
  body:        'BODY',
  blank:       'BLANK',
  quote:       'QUOTE',
  sequence:    'SEQUENCE',
  'header-body':'HEADER-BODY',
};

const ADD_PAGE_TYPES: { type: PageLayoutType; label: string }[] = [
  { type: 'body',       label: '본문 (BODY)' },
  { type: 'blank',      label: '빈 페이지 (BLANK)' },
  { type: 'chapter',    label: '챕터 제목 (CHAPTER)' },
  { type: 'quote',      label: '인용구 (QUOTE)' },
  { type: 'toc',        label: '목차 (TOC)' },
  { type: 'sequence',   label: '시퀀스 (SEQUENCE)' },
  { type: 'header-body', label: '제목+본문 (HEADER-BODY)' },
];

interface DocumentStructureProps {
  book: Book;
  selectedPageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: (layoutType: PageLayoutType) => void;
  onDeletePage: (pageId: string) => void;
  onUpdatePageTitle?: (pageId: string, title: string) => void;
  onReorderPages: (pages: Page[]) => void;
  onUpdatePageType?: (pageId: string, layoutType: PageLayoutType) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function DocumentStructure({
  book,
  selectedPageIndex,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onUpdatePageTitle,
  onReorderPages,
  onUpdatePageType,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: DocumentStructureProps) {
  const [selectedPageIdForTypeChange, setSelectedPageIdForTypeChange] = useState<string | null>(null);
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
      style={{ width: '280px', minWidth: '280px', backgroundColor: '#2C261F' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span
          className="text-[9px] font-bold tracking-widest"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          DOCUMENT STRUCTURE
        </span>
        <div className="flex items-center gap-1">
          {/* Undo Button */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{
              color: canUndo ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
              backgroundColor: canUndo ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
              opacity: canUndo ? 1 : 0.5,
              cursor: canUndo ? 'pointer' : 'not-allowed',
            }}
            title={canUndo ? '실행취소 (Undo)' : '실행취소 불가'}
          >
            <RotateCcw size={14} />
          </button>
          
          {/* Redo Button */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{
              color: canRedo ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
              backgroundColor: canRedo ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
              opacity: canRedo ? 1 : 0.5,
              cursor: canRedo ? 'pointer' : 'not-allowed',
            }}
            title={canRedo ? '다시실행 (Redo)' : '다시실행 불가'}
          >
            <RotateCw size={14} />
          </button>

          {/* Add Page Button */}
          <button
            onClick={() => onAddPage('blank')}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.05)' }}
            title="빈 페이지 추가 (BLANK)"
          >
            <Plus size={14} />
          </button>
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
              className="flex items-center px-4 py-3 cursor-pointer transition-colors select-none group relative"
              style={{
                backgroundColor: isDragging
                  ? 'rgba(0,0,0,0.1)'
                  : isSelected
                  ? '#1F1B17'
                  : isHovered
                  ? 'rgba(255,255,255,0.03)'
                  : 'transparent',
                opacity: isDragging ? 0.5 : 1,
                borderLeft: isSelected ? '3px solid #B5714A' : '3px solid transparent',
                paddingLeft: 'calc(1rem - 3px)',
                minHeight: '44px',
                gap: '8px',
              }}
            >
              {/* Number */}
              <span
                className="font-mono text-[12px] font-bold shrink-0"
                style={{ color: isSelected ? '#B5714A' : 'rgba(255,255,255,0.25)' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>

              {/* Title */}
              {isSelected && page.layoutType !== 'body' ? (
                <input
                  type="text"
                  value={page.title || ''}
                  onChange={(e) => onUpdatePageTitle?.(page.id, e.target.value)}
                  placeholder="제목 입력..."
                  className="flex-1 bg-transparent outline-none text-[12px] font-medium min-w-0"
                  style={{ color: '#FFE0C0' }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="flex-1 text-[12px] font-medium truncate"
                  style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)' }}
                >
                  {displayTitle}
                </span>
              )}

              {/* Delete button (Show only on hover) */}
              {isHovered && !isSelected && book.pages.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }}
                  className="shrink-0 cursor-pointer transition-colors p-1 flex items-center justify-center rounded"
                  style={{ color: 'rgba(255,80,80,0.7)', height: '24px', width: '24px' }}
                  title="페이지 삭제"
                >
                  <Trash2 size={14} />
                </button>
              )}

              {/* Badge (Always visible) */}
              <div className="relative inline-block shrink-0">
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedPageIdForTypeChange(selectedPageIdForTypeChange === page.id ? null : page.id);
                  }}
                  className="text-[9px] px-2 py-1 rounded transition-colors cursor-pointer h-6 flex items-center"
                  style={{
                    backgroundColor: isSelected ? 'rgba(181,113,74,0.3)' : 'rgba(255,255,255,0.15)',
                    color: isSelected ? '#FFE0C0' : '#FFFFFF',
                  }}
                  title="타입 변경"
                >
                  {badge}
                </button>

                {/* Type change dropdown */}
                {selectedPageIdForTypeChange === page.id && (
                  <div
                    className="absolute right-0 top-full mt-1 z-50 rounded-lg overflow-hidden shadow-2xl"
                    style={{ backgroundColor: '#3D3530', border: '1px solid rgba(255,255,255,0.08)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {ADD_PAGE_TYPES.map(({ type, label }) => (
                      <button
                        key={type}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdatePageType?.(page.id, type);
                          setSelectedPageIdForTypeChange(null);
                        }}
                        className="w-full text-left px-3 py-2 text-[10px] font-medium transition-colors cursor-pointer"
                        style={{ 
                          color: 'rgba(255,255,255,0.7)',
                          backgroundColor: page.layoutType === type ? 'rgba(181,113,74,0.3)' : 'transparent',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = page.layoutType === type ? 'rgba(181,113,74,0.3)' : 'transparent')}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
