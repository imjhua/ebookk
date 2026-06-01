/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutContentProps } from '../layout-helpers';

export default function ChapterLayoutContent({
  page,
  isScreen,
  unit,
  uF,
}: LayoutContentProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: uF(4),
      }}
    >
      <span
        style={{
          fontFamily: 'monospace',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          opacity: 0.28,
          fontSize: uF(0.8),
          display: 'block',
          marginBottom: uF(1.8),
        }}
      >
        PART
      </span>
      <h2
        style={{
          fontFamily: 'serif',
          fontWeight: 700,
          fontSize: uF(2.7),
          letterSpacing: '-0.01em',
          lineHeight: 1.05,
          textAlign: 'center',
          margin: `0 0 ${uF(1.4)}`,
        }}
      >
        {page.title || ''}
      </h2>
      {page.content ? (
        <p
          style={{
            fontFamily: 'serif',
            fontStyle: 'italic',
            textAlign: 'center',
            opacity: 0.55,
            lineHeight: 1.5,
            fontSize: uF(1.05),
            margin: 0,
          }}
        >
          {page.content}
        </p>
      ) : null}
    </div>
  );
}
