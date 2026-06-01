/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PrintSettings } from '../../types';

interface PageNumberRendererProps {
  pageNum: number;
  isRightPage: boolean;
  isScreen: boolean;
  unit: string;
  paddingLeft: string | number;
  paddingRight?: string | number;
  contentWidth: string;
  fontSize: string;
  settings: PrintSettings;
  marginBottom: string | number;
}

/**
 * Renders page number in the footer
 * - Left pages: number on the left
 * - Right pages: number on the right
 * 
 * Note: This component is only rendered when showPageNumbers is true in PageRenderer.
 * Layout-specific defaults are handled there, so no need to check settings again.
 */
export default function PageNumberRenderer({
  pageNum,
  isRightPage,
  isScreen,
  unit,
  paddingLeft,
  contentWidth,
  fontSize,
  settings,
  marginBottom,
}: PageNumberRendererProps) {
  // Note: showPageNumbers filtering is done in PageRenderer based on layout config
  // This component assumes it's only called when page numbers should be shown

  const paddingLeftStr = typeof paddingLeft === 'number' ? `${paddingLeft}${unit}` : paddingLeft;
  const marginBottomStr = typeof marginBottom === 'number' ? `${marginBottom}${unit}` : marginBottom;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: marginBottomStr,
        left: paddingLeftStr,
        width: contentWidth,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'monospace',
        fontSize,
        color: isScreen ? undefined : 'rgba(0,0,0,0.6)',
      }}
    >
      {!isRightPage ? (
        <>
          <span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>
            {pageNum}
          </span>
          <span style={{ opacity: 0 }}>.</span>
        </>
      ) : (
        <>
          <span style={{ opacity: 0 }}>.</span>
          <span style={{ fontWeight: 700, color: isScreen ? undefined : '#B5714A' }}>
            {pageNum}
          </span>
        </>
      )}
    </div>
  );
}
