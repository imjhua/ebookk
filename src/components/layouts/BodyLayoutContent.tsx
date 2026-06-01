/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutContentProps } from '../layout-helpers';

export default function BodyLayoutContent({
  page,
  uF,
  settings,
}: LayoutContentProps) {
  return (
    <div style={{ height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      <div
        style={{
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
