/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutContentProps } from '../layout-helpers';

export default function BlankLayoutContent({
  isScreen,
  uF,
}: LayoutContentProps) {
  return (
    <>
      {isScreen && (
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <span style={{ fontSize: uF(1.2), opacity: 0.5, fontFamily: 'monospace' }}>
            [빈페이지]
          </span>
        </div>
      )}
    </>
  );
}
