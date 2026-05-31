/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Book, PrintSettings, PRESET_PAPER_SIZES } from '../types';
import { Printer, CheckCircle, Info, Scissors, Eye, BookOpen } from 'lucide-react';

interface PrintManagerProps {
  book: Book;
  settings: PrintSettings;
  scale: number;
}

export default function PrintManager({ book, settings, scale }: PrintManagerProps) {
  const paperSize = PRESET_PAPER_SIZES.find((p) => p.id === settings.paperSizeId) || PRESET_PAPER_SIZES[0];

  const handlePrint = () => {
    window.print();
  };

  const ptToMm = 0.35277;
  // Font sizes inside printing are hardcoded as standard point sizes in CSS,
  // but for onscreen "Print Preview" grid, we can scale them using the calibration factor!
  const fontPx = settings.fontSize * ptToMm * scale;

  // Let's count how many total physical pages are there in the actual book
  let absolutePageCounter = 1;
  const printablePagesList: Array<{ text: string; isRightPage: boolean }> = [];

  book.pages.forEach((page) => {
    const isRightPage = absolutePageCounter % 2 !== 0;
    printablePagesList.push({ text: page.content, isRightPage });
    absolutePageCounter++;
  });

  // Cover Style themes mapping
  const coverThemeColors = {
    slate: 'bg-slate-800 text-slate-100 border-slate-700',
    navy: 'bg-[#1E293B] text-slate-100 border-indigo-900',
    forest: 'bg-[#14532D] text-[#ECECE2] border-[#155e27]',
    terracotta: 'bg-[#7C2D12] text-[#FEF3C7] border-[#8e3518]',
    parchment: 'bg-[#FCFAF2] text-[#2C261F] border-[#EADFCA]',
    gold: 'bg-[#451A03] text-amber-200 border-amber-800',
  }[book.coverTheme];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Printer size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Pre-Press & Print Panel</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">책 실제 규격 인쇄 및 모형 미리보기</h2>
          <p className="text-xs text-slate-500">실제 종이 크기 및 여백 재단선 레이아웃 세팅</p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-bold text-sm shadow-md transition-all scale-100 hover:scale-[1.02] cursor-pointer"
        >
          <Printer size={16} />
          실물 책으로 프린트하기 (PDF 저장)
        </button>
      </div>

      {/* Guide notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3 md:col-span-2">
          <Info className="text-indigo-600 shrink-0 mt-1" size={16} />
          <div>
            <h4 className="text-xs font-bold text-indigo-850 mb-2 flex items-center gap-1">
              <span>인쇄 시 브라우저 설정 필수 가이드 (작업물 보존을 위한 필수 사항 ⚠️)</span>
            </h4>
            <div className="text-[11px] text-indigo-950/80 leading-relaxed space-y-2">
              <p>
                ① <strong>[배경 그래픽] 체크 활성화 (필수) 🎨</strong>: 
                웹 브라우저는 기본적으로 잉크 절약을 위해 배경 색상과 테마를 인쇄에서 제외시키는 프리셋을 갖고 있습니다. 인쇄 설정창 우측의 옵션 항목에서 <strong>[배경 그래픽]</strong>에 <strong>반드시 체크</strong>를 해주셔야, 선택하신 Forest(초록색), Navy(남색) 등의 표지 컬러가 선명하게 채워진 채 깔끔히 인쇄됩니다.
              </p>
              <p>
                ② <strong>[머리글과 바닥글] 체크 해제 ✂️</strong>: 
                이 항목이 켜져 있으면 책 지면의 위아래에 웹사이트 URL, 날짜, 페이지 주소 등이 자동으로 인쇄되어 지저분해집니다. 반드시 체크를 <strong>해제</strong>하여 정갈한 단행본으로 인쇄해주십시오.
              </p>
              <p>
                ③ <strong>[용지 크기] 설정 📏 (현재 선택된 서적 규격: <span className="text-indigo-600 font-bold underline">{paperSize.name.split(' (')[0]} - {paperSize.width}x{paperSize.height}mm</span>)</strong>: 
                웹 브라우저의 기본 인쇄 설정은 A4 혹은 Letter 용지로 유지되는 경우가 많습니다. 인쇄 설정창 우측의 <strong>[설정 더보기]</strong>(또는 상세 설정) 메뉴를 확장하여 <strong>[용지 크기]</strong>를 현재 집필하신 책 규격인 <strong>{paperSize.name.split(' (')[0]} ({paperSize.width}x{paperSize.height}mm)</strong>로 맞춰주셔야 메인 영역의 하얀 좌우 빈 여백이 사라지고 면 지면에 꽉 찬 완벽한 단행본이 인쇄됩니다!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex items-start gap-3 md:col-span-2">
          <Scissors className="text-amber-600 shrink-0 mt-0.5" size={16} />
          <div>
            <h4 className="text-xs font-bold text-amber-800 mb-1">양면 제본 가이드 (스프레드 여백)</h4>
            <p className="text-[11px] text-amber-950/70 leading-relaxed">
              책은 가운데를 묶는 제본선 영역이 들어가므로 홀수 쪽(우측 페이지)은 <strong>왼쪽에 추가 여백</strong>이, 
              짝수 쪽(좌측 페이지)은 <strong>오른쪽에 추가 여백</strong>이 자동으로 삽입되어 완벽한 밸런스를 맞춥니다.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Eye className="text-indigo-600" size={16} />
        <h3 className="text-sm font-semibold text-slate-800">출력 전 실제 인쇄 배치 구조 (총 {printablePagesList.length + 1}페이지)</h3>
      </div>

      {/* Printed pages simulated deck preview */}
      <div className="bg-slate-100 border border-slate-200/50 rounded-2xl p-6 overflow-auto max-h-[480px] flex flex-wrap gap-8 justify-center items-center select-none scrollbar-thin">
        
        {/* 1. SEED BOOK COVER (표지 미리보기) */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Page I (Front Cover)</span>
          <div 
            style={{
              width: `${paperSize.width * scale * 0.5}px`, // scaled 50% for grid representation
              height: `${paperSize.height * scale * 0.5}px`,
              fontSize: `${fontPx * 0.5}px`
            }}
            className={`flex flex-col justify-between p-4 border rounded shadow-md text-center shrink-0 ${coverThemeColors}`}
          >
            <div className="flex flex-col items-center gap-1 mt-4">
              <span className="text-[8px] opacity-60 font-mono tracking-widest leading-none block">{book.subtitle || 'MEMOIR NOVEL'}</span>
              <h2 className="text-sm font-serif font-black select-none tracking-tight leading-6 mt-1 px-1">{book.title}</h2>
              <div className="w-6 h-px bg-current opacity-30 my-1" />
              <p className="text-[9px] font-medium leading-none block">{book.author}</p>
            </div>
            
            <div className="flex flex-col items-center gap-1 mb-2">
              <BookOpen className="opacity-70" size={14} />
              <span className="text-[8px] font-mono opacity-50 block">{book.publisher || 'PRIVATE PRESS'}</span>
            </div>
          </div>
        </div>

        {/* 2. CHRONOLOGICAL PAGES SPREADS */}
        {printablePagesList.map((page, index) => {
          // padding computations
          const pTopPx = settings.margins.top * scale * 0.5;
          const pBottomPx = settings.margins.bottom * scale * 0.5;
          const pInnerPx = settings.margins.inner * scale * 0.5;
          const pOuterPx = settings.margins.outer * scale * 0.5;

          const paddingLeftPx = page.isRightPage ? pInnerPx : pOuterPx;
          const paddingRightPx = page.isRightPage ? pOuterPx : pInnerPx;

          const absolutePageNum = index + 2; // cover is Page 1

          return (
            <div key={index} className="flex flex-col items-center gap-2 relative">
              <span className="text-[10px] font-mono font-bold text-slate-400">
                Page {absolutePageNum} ({page.isRightPage ? 'Right' : 'Left'})
              </span>
              
              <div
                style={{
                  width: `${paperSize.width * scale * 0.5}px`,
                  height: `${paperSize.height * scale * 0.5}px`,
                  paddingTop: `${pTopPx}px`,
                  paddingBottom: `${pBottomPx}px`,
                  paddingLeft: `${paddingLeftPx}px`,
                  paddingRight: `${paddingRightPx}px`,
                  fontSize: `${fontPx * 0.45}px`, // downscaled for grid item
                  lineHeight: settings.lineHeight,
                }}
                className={`bg-white border text-slate-800 relative shadow-md transition-all duration-150 overflow-hidden text-left flex flex-col justify-between`}
              >
                {/* Crop/Trim marks simulation on miniature layout */}
                {settings.showCropMarks && (
                  <div className="absolute inset-0 pointer-events-none border border-dashed border-indigo-200" />
                )}

                {/* Simulated running head */}
                {settings.showRunningHead && (
                  <div className="border-b border-slate-200 pb-0.5 text-[7px] font-mono text-slate-400 flex justify-between leading-none mb-1">
                    {!page.isRightPage ? (
                      <>
                        <span className="truncate max-w-[60px] block">{book.title}</span>
                        <span className="truncate max-w-[60px] block">{book.author}</span>
                      </>
                    ) : (
                      <>
                        <span className="truncate max-w-[60px] block">{book.author}</span>
                        <span className="truncate max-w-[60px] block">{book.title}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Content preview */}
                <div className="h-full overflow-hidden leading-snug whitespace-pre-wrap text-[7px] text-slate-700">
                  {page.text}
                </div>

                {/* Simulated page numbers */}
                {settings.showPageNumbers && (
                  <div className="text-[6px] font-mono text-slate-400 mt-1 leading-none pt-0.5 flex justify-between">
                    {!page.isRightPage ? (
                      <>
                        <span className="font-bold text-indigo-600 font-mono block">{absolutePageNum}</span>
                        <span className="opacity-0">.</span>
                      </>
                    ) : (
                      <>
                        <span className="opacity-0">.</span>
                        <span className="font-bold text-indigo-600 font-mono block">{absolutePageNum}</span>
                      </>
                    )}
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
