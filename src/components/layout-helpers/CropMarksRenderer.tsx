/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CropMarksRendererProps {
  isScreen: boolean;
  showCropMarks: boolean;
}

/**
 * Renders crop marks (corner registration marks) for print mode
 */
export default function CropMarksRenderer({
  isScreen,
  showCropMarks,
}: CropMarksRendererProps) {
  if (isScreen || !showCropMarks) {
    return null;
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Top-left corner */}
      <div style={{ position: 'absolute', top: '-3mm', left: '-3mm', width: '10mm', height: '0.2mm', backgroundColor: '#bbb' }} />
      <div style={{ position: 'absolute', top: '-3mm', left: '-3mm', width: '0.2mm', height: '10mm', backgroundColor: '#bbb' }} />
      
      {/* Top-right corner */}
      <div style={{ position: 'absolute', top: '-3mm', right: '-3mm', width: '10mm', height: '0.2mm', backgroundColor: '#bbb' }} />
      <div style={{ position: 'absolute', top: '-3mm', right: '-3mm', width: '0.2mm', height: '10mm', backgroundColor: '#bbb' }} />
      
      {/* Bottom-left corner */}
      <div style={{ position: 'absolute', bottom: '-3mm', left: '-3mm', width: '10mm', height: '0.2mm', backgroundColor: '#bbb' }} />
      <div style={{ position: 'absolute', bottom: '-3mm', left: '-3mm', width: '0.2mm', height: '10mm', backgroundColor: '#bbb' }} />
      
      {/* Bottom-right corner */}
      <div style={{ position: 'absolute', bottom: '-3mm', right: '-3mm', width: '10mm', height: '0.2mm', backgroundColor: '#bbb' }} />
      <div style={{ position: 'absolute', bottom: '-3mm', right: '-3mm', width: '0.2mm', height: '10mm', backgroundColor: '#bbb' }} />
    </div>
  );
}
