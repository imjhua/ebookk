/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutContentProps, COVER_THEME_MAP } from '../layout-helpers';

export default function CoverLayoutContent({
  page,
  book,
  isScreen,
  u,
  uF,
  uN,
  unit,
}: LayoutContentProps) {
  const coverTheme = COVER_THEME_MAP[(book.theme as keyof typeof COVER_THEME_MAP) || 'classic'] || COVER_THEME_MAP.classic;

  const accentLineW = `${uN(8)}${unit}`;
  const dividerW = `${uN(10)}${unit}`;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isScreen ? `${uN(1.5)}px` : '2mm' }}>
        <span
          style={{
            letterSpacing: '0.18em',
            fontFamily: 'sans-serif',
            textTransform: 'uppercase',
            opacity: 0.7,
            fontSize: uF(0.85),
          }}
        >
          {page.subtitle || ''}
        </span>
        <div
          style={{
            width: accentLineW,
            height: isScreen ? 1 : '0.3mm',
            backgroundColor: coverTheme.accent,
            opacity: 0.4,
            marginTop: isScreen ? `${uN(2)}px` : '2mm',
          }}
        />
        <h1
          style={{
            fontFamily: 'serif',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            margin: `${isScreen ? uN(4) : 4}${unit} 0 0`,
            padding: `0 ${isScreen ? uN(2) : 2}${unit}`,
            fontSize: uF(2.4),
          }}
        >
          {page.title}
        </h1>
        <div
          style={{
            width: dividerW,
            height: isScreen ? 1 : '0.3mm',
            backgroundColor: coverTheme.fg,
            opacity: 0.25,
            margin: `${isScreen ? uN(3) : 3}${unit} 0`,
          }}
        />
        <p
          style={{
            fontFamily: 'serif',
            fontWeight: 500,
            marginTop: isScreen ? `${uN(2)}px` : '2mm',
            opacity: 0.85,
            fontSize: uF(1.2),
          }}
        >
          {page.author || ''}
        </p>
      </div>
      <span style={{ fontFamily: 'monospace', letterSpacing: '0.2em', opacity: 0.6, fontSize: uF(0.75) }}>
        {book.publisher || ''}
      </span>
    </>
  );
}
