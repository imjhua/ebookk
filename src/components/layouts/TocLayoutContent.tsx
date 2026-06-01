/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TocEntry } from '../../types';
import { LayoutContentProps, CARD_COLORS_MAP, PaperThemeType } from '../layout-helpers';

export default function TocLayoutContent({
  page,
  isScreen,
  unit,
  u,
  uF,
  paperTheme,
}: LayoutContentProps) {
  let entries: TocEntry[] = [];

  // Try to get tocEntries from page object first (from GAS), then fallback to parsing content
  if (page.tocEntries && Array.isArray(page.tocEntries)) {
    entries = page.tocEntries;
  } else {
    try {
      entries = page.content ? JSON.parse(page.content) : [];
    } catch {
      entries = [];
    }
  }

  const cardColors = CARD_COLORS_MAP[paperTheme];

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: uF(1.8),
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            opacity: 0.4,
            fontSize: uF(0.8),
          }}
        >
          INDEX
        </span>
        <h2
          style={{
            fontFamily: 'serif',
            fontWeight: 700,
            fontSize: uF(2.2),
            margin: `${uF(0.5)} 0 ${uF(0.6)}`,
            lineHeight: 1.1,
          }}
        >
          {page.title || '목차'}
        </h2>
        <div
          style={{
            width: isScreen ? `${u(6)}px` : '8mm',
            height: isScreen ? 1 : '0.2mm',
            backgroundColor: 'currentColor',
            opacity: 0.2,
          }}
        />
      </div>

      {/* Entries */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: uF(1.2),
        }}
      >
        {entries.map((entry, i) => (
          <div
            key={i}
            style={{
              backgroundColor: cardColors.cardBg,
              border: isScreen ? `1px solid ${cardColors.cardBorder}` : `0.3mm solid ${cardColors.cardBorder}`,
              borderRadius: isScreen ? '6px' : '2mm',
              padding: `${uF(0.6)} ${uF(0.8)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: uF(0.4),
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  opacity: 0.55,
                  fontSize: uF(0.75),
                }}
              >
                {entry.chapter}
              </span>
              <span style={{ fontFamily: 'monospace', opacity: 0.55, fontSize: uF(0.75) }}>
                P.{entry.pageNum}
              </span>
            </div>
            <div
              style={{
                height: isScreen ? 1 : '0.15mm',
                backgroundColor: 'currentColor',
                opacity: 0.12,
              }}
            />
            <p
              style={{
                fontFamily: 'serif',
                fontSize: uF(1.0),
                lineHeight: 1.35,
                margin: 0,
                color: 'currentColor',
              }}
            >
              {entry.title}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
