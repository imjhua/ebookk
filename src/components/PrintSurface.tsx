/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Book, PrintSettings, PRESET_PAPER_SIZES } from '../types';

interface PrintSurfaceProps {
  book: Book;
  settings: PrintSettings;
}

export default function PrintSurface({ book, settings }: PrintSurfaceProps) {
  const paperSize = PRESET_PAPER_SIZES.find((p) => p.id === settings.paperSizeId) || PRESET_PAPER_SIZES[0];

  // Dynamic print size CSS variables synchronization
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--print-paper-width', `${paperSize.width}mm`);
    root.style.setProperty('--print-paper-height', `${paperSize.height}mm`);
    
    return () => {
      root.style.removeProperty('--print-paper-width');
      root.style.removeProperty('--print-paper-height');
    };
  }, [paperSize.width, paperSize.height]);

  // Let's count how many total physical pages are there in the actual book
  let absolutePageCounter = 1;
  const printablePagesList: Array<{ text: string; isRightPage: boolean }> = [];

  book.pages.forEach((page) => {
    const isRightPage = absolutePageCounter % 2 !== 0;
    printablePagesList.push({ text: page.content, isRightPage });
    absolutePageCounter++;
  });

  // Book theme cover colors
  const themeConfig = {
    classic:  { bg: '#2C261F', color: '#FAF6EC', borderClass: 'border-[#4a3f30]' },
    modern:   { bg: '#111111', color: '#ffffff', borderClass: 'border-[#333]' },
    academic: { bg: '#1E3A5F', color: '#ffffff', borderClass: 'border-[#2a4f80]' },
    zen:      { bg: '#f9f9f7', color: '#333333', borderClass: 'border-[#ccc]' },
  }[book.theme] || { bg: '#2C261F', color: '#FAF6EC', borderClass: 'border-[#4a3f30]' };

  return (
    <div id="print-book-surface">
      {/* PHYSICAL SINGLE PRE-PRESS COVER */}
      <div 
        style={{
          width: `${paperSize.width}mm`,
          height: `${paperSize.height}mm`,
          backgroundColor: themeConfig.bg,
          color: themeConfig.color,
        }}
        className={`print-sheet print-cover print-bleed relative overflow-hidden flex flex-col justify-between items-center text-center p-[20mm] box-border ${themeConfig.borderClass}`}
      >
        {/* Bleed outline spacer */}
        <div className="cover-border w-full h-full flex flex-col justify-between items-center py-[15mm]">
          <div className="flex flex-col items-center">
            <span className="text-[11pt] tracking-[0.15em] font-sans opacity-75 block">{book.subtitle || 'MEMOIR NOVEL'}</span>
            <h1 className="text-[28pt] font-serif font-black leading-tight tracking-tight mt-[8mm] mb-[4mm] px-[4mm]">{book.title}</h1>
            <div className="w-[40mm] h-[1.5px] bg-current opacity-30 my-[3mm]" />
            <p className="text-[14pt] font-serif font-medium mt-[5mm]">{book.author} 저</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-[10mm] h-[10mm] border border-solid border-current/30 rounded flex items-center justify-center mb-[6mm]">
              <div className="w-3 h-3 border-b border-r border-solid border-current/40 rounded-sm transform rotate-45" />
            </div>
            <span className="text-[10pt] font-mono tracking-widest opacity-80 block">{book.publisher || 'PRIVATE PUBLISHER'}</span>
          </div>
        </div>
      </div>

      {/* PRINTABLE PAGES ITERATION */}
      {printablePagesList.map((page, index) => {
        // Left-Right margins mapping in mm
        const isRight = page.isRightPage;
        const pLeftMm = isRight ? settings.margins.inner : settings.margins.outer;
        const pRightMm = isRight ? settings.margins.outer : settings.margins.inner;

        const globalPageNum = index + 2;

        return (
          <div
            key={index}
            style={{
              width: `${paperSize.width}mm`,
              height: `${paperSize.height}mm`,
              paddingTop: `${settings.margins.top}mm`,
              paddingBottom: `${settings.margins.bottom}mm`,
              paddingLeft: `${pLeftMm}mm`,
              paddingRight: `${pRightMm}mm`,
            }}
            className="print-sheet relative overflow-hidden flex flex-col justify-between bg-white text-black text-left box-border"
          >
            {/* CROP MARKS (재단선 가이드) */}
            {settings.showCropMarks && (
              <div className="absolute inset-0 pointer-events-none p-0 print-crop-box">
                {/* Top-Left Trim Corner Crosshairs */}
                <div className="absolute top-[-3mm] left-[-3mm] w-[10mm] h-[0.2mm] bg-neutral-300" />
                <div className="absolute top-[-3mm] left-[-3mm] w-[0.2mm] h-[10mm] bg-neutral-300" />
                
                {/* Top-Right Trim Corner Crosshairs */}
                <div className="absolute top-[-3mm] right-[-3mm] w-[10mm] h-[0.2mm] bg-neutral-300" />
                <div className="absolute top-[-3mm] right-[-3mm] w-[0.2mm] h-[10mm] bg-neutral-300" />

                {/* Bottom-Left Trim Corner Crosshairs */}
                <div className="absolute bottom-[-3mm] left-[-3mm] w-[10mm] h-[0.2mm] bg-neutral-300" />
                <div className="absolute bottom-[-3mm] left-[-3mm] w-[0.2mm] h-[10mm] bg-neutral-300" />

                {/* Bottom-Right Trim Corner Crosshairs */}
                <div className="absolute bottom-[-3mm] right-[-3mm] w-[10mm] h-[0.2mm] bg-neutral-300" />
                <div className="absolute bottom-[-3mm] right-[-3mm] w-[0.2mm] h-[10mm] bg-neutral-300" />
              </div>
            )}

            {/* PRINT RUNNING HEAD */}
            {settings.showRunningHead && (
              <div 
                style={{
                  fontSize: '8.5pt',
                  lineHeight: '1',
                  marginBottom: '4mm'
                }}
                className="print-running-head border-b border-black/15 pb-[1.5mm] flex justify-between tracking-wide text-neutral-500 font-sans"
              >
                {!isRight ? (
                  <>
                    <span>{book.title}</span>
                    <span>{book.author}</span>
                  </>
                ) : (
                  <>
                    <span>{book.author}</span>
                    <span>{book.title}</span>
                  </>
                )}
              </div>
            )}

            {/* PRINT CONTENT AREA */}
            <div 
              style={{
                fontSize: `${settings.fontSize}pt`,
                lineHeight: settings.lineHeight,
                fontFamily: settings.fontFamily === 'Noto Serif KR' ? '"Noto Serif KR", serif' : 'var(--font-sans)',
              }}
              className="print-content h-full w-full whitespace-pre-wrap break-words text-neutral-900 leading-normal font-light"
            >
              {page.text}
            </div>

            {/* PRINT RUNNING FOOTER (쪽번호) */}
            {settings.showPageNumbers && (
              <div 
                style={{
                  fontSize: '8.5pt',
                  lineHeight: '1',
                  marginTop: '4mm'
                }}
                className="print-running-foot flex justify-between font-mono text-neutral-600"
              >
                {!isRight ? (
                  <>
                    <span className="font-bold">{globalPageNum}</span>
                    <span className="opacity-0 font-mono">.</span>
                  </>
                ) : (
                  <>
                    <span className="opacity-0 font-mono">.</span>
                    <span className="font-bold">{globalPageNum}</span>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
