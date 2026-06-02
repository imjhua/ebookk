/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutContentProps } from '../layout-helpers';

export default function HeaderBodyLayoutContent({
  page,
  uF,
  settings,
}: LayoutContentProps) {
  return (
    <div style={{ height: '100%', width: '100%', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Page title - independent of running head */}
      {page.title && (
        <div
          style={{
            fontSize: uF(1.6),
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: uF(0.8),
            paddingBottom: uF(0.4),
            borderBottom: `1px solid rgba(0,0,0,0.15)`,
          }}
        >
          {page.title}
        </div>
      )}
      
      {/* Content body with drop cap */}
      <div
        style={{
          flex: 1,
          fontSize: uF(1),
          lineHeight: settings.lineHeight,
          overflow: 'hidden',
          height: '100%',
        }}
      >
        {page.content.length > 0 && (
          <span
            style={{
              float: 'left',
              fontSize: uF(3.4),
              lineHeight: 0.82,
              marginRight: uF(0.08),
              marginTop: uF(0.06),
              fontWeight: 700,
              fontFamily: 'inherit',
            }}
          >
            {page.content[0]}
          </span>
        )}
        <span className="whitespace-pre-wrap break-words">
          {page.content.length > 0 ? page.content.slice(1) : ''}
        </span>
      </div>
    </div>
  );
}
