/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutContentProps } from '../layout-helpers';

export default function QuoteLayoutContent({
  page,
  uF,
  settings,
}: LayoutContentProps) {
  return (
    <div style={{ position: 'relative', zIndex: 10, width: '100%', textAlign: 'center' }}>
      <div
        className="whitespace-pre-wrap break-words italic"
        style={{
          fontSize: uF(1.65),
          lineHeight: settings.lineHeight * 1.15,
        }}
      >
        {page.content}
      </div>
    </div>
  );
}
