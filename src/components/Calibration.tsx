/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CreditCard, Ruler, RotateCcw } from 'lucide-react';

interface CalibrationProps {
  scale: number;
  onChangeScale: (newScale: number) => void;
}

export default function Calibration({ scale, onChangeScale }: CalibrationProps) {
  // Constant measurements for a standard ID card in ISO/IEC 7810 ID-1: 85.6mm x 53.98mm
  const CARD_WIDTH_MM = 85.6;
  const CARD_HEIGHT_MM = 53.98;

  const handleReset = () => {
    // browser default approximation: ~3.78 pixels per mm (96 DPI)
    onChangeScale(3.78);
  };

  // Convert scale to DPI for tech explanation
  const currentDPL = Math.round(scale * 25.4);

  return (
    <div id="calibration-widget" className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: '#FDFAF6', border: '1px solid #E8E0D4' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#F5F0E8', color: '#B5714A' }}>
          <Ruler size={18} />
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: '#2A2420' }}>실물 크기 1:1 보정 (Calibration)</h3>
          <p className="text-xs" style={{ color: '#7A6F66' }}>모니터 해상도별 실제 출력 크기 싱크 맞춰기</p>
        </div>
      </div>

      <p className="text-xs leading-relaxed p-3.5 rounded-xl mb-6" style={{ backgroundColor: '#F5F0E8', color: '#7A6F66' }}>
        화면에 <strong>신용카드</strong>나 <strong>신분증</strong>을 직접 대고, 아래 가이드 카드의 크기가 
        실물 카드와 가로가 똑같아지도록 아래 슬라이더를 세밀하게 조절해 주세요. 완료되면 
        화면의 책 크기가 <strong>실제 인쇄될 1:1 실물 크기</strong>로 표시됩니다!
      </p>

      {/* Interactive Card Canvas */}
      <div className="relative flex justify-center py-6 rounded-2xl mb-6 overflow-hidden min-h-[180px] items-center" style={{ backgroundColor: 'rgba(42,36,32,0.05)' }}>
        {/* Virtual Credit Card */}
        <div 
          style={{
            width: `${CARD_WIDTH_MM * scale}px`,
            height: `${CARD_HEIGHT_MM * scale}px`,
            transition: 'width 0.1s ease-out, height 0.1s ease-out',
          }}
          className="relative bg-gradient-to-tr from-slate-800 via-indigo-950 to-slate-900 rounded-xl shadow-xl flex flex-col justify-between p-4 border border-white/15 text-white overflow-hidden select-none"
        >
          {/* Card Accent Grid */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[9px] tracking-wider text-slate-400 font-mono">CALIBRATION CARD</span>
            <div className="w-8 h-6 bg-amber-400/90 rounded opacity-80" /> {/* Chip */}
          </div>

          <div className="relative z-10 my-1">
            <div className="text-xs font-mono tracking-widest text-slate-300">•••• •••• •••• ••••</div>
          </div>

          <div className="flex justify-between items-end relative z-10">
            <div className="flex flex-col">
              <span className="text-[7px] text-slate-500 uppercase font-mono">Card Width</span>
              <span className="text-[10px] font-mono font-medium text-indigo-200">85.60 mm</span>
            </div>
            <CreditCard size={18} className="text-slate-400 opacity-60" />
          </div>
        </div>
      </div>

      {/* Control Slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs font-medium" style={{ color: '#2A2420' }}>
          <span>비율 조절 슬라이더</span>
          <span className="font-mono px-2 py-0.5 rounded text-[11px]" style={{ backgroundColor: '#F5F0E8', color: '#B5714A' }}>
            {scale.toFixed(2)} px/mm ({currentDPL} DPI)
          </span>
        </div>

        <input
          type="range"
          min="2.0"
          max="6.0"
          step="0.01"
          value={scale}
          onChange={(e) => onChangeScale(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-lg appearance-none cursor-ew-resize outline-none"
          style={{ accentColor: '#B5714A', backgroundColor: '#E8E0D4' }}
        />

        <div className="flex justify-between items-center text-[10px] font-mono" style={{ color: '#B4A99E' }}>
          <span>작은 모니터 (DPI 낮음)</span>
          <span>큰 모니터/고정밀 (DPI 높음)</span>
        </div>

        <div className="pt-2 flex justify-end" style={{ borderTop: '1px solid #E8E0D4' }}>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
            style={{ color: '#B4A99E' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#B5714A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#B4A99E')}
          >
            <RotateCcw size={13} />
            기본값 복원 (96DPI)
          </button>
        </div>
      </div>
    </div>
  );
}
