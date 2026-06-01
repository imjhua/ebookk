/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutContentProps } from '../layout-helpers';

export default function SequenceLayoutContent({
  page,
  uF,
}: LayoutContentProps) {
  const seqLines = page.content.split('\n').filter(Boolean);
  const seqEntries = seqLines.map((line) => {
    const idx = line.lastIndexOf(' ');
    return idx === -1 ? { left: line, right: '' } : { left: line.slice(0, idx), right: line.slice(idx + 1) };
  });

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {seqEntries.map((entry, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingTop: uF(0.25),
            paddingBottom: uF(0.25),
            borderBottom: `0.2mm solid rgba(0,0,0,0.07)`,
          }}
        >
          <span>{entry.left}</span>
          <span
            style={{
              fontFamily: 'monospace',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontSize: uF(0.78),
              opacity: 0.5,
              marginLeft: uF(1),
            }}
          >
            {entry.right}
          </span>
        </div>
      ))}
    </div>
  );
}
