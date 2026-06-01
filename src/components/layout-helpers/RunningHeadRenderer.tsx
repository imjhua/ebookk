/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Book, PrintSettings } from '../../types';

interface RunningHeadRendererProps {
  show: boolean;
  isScreen: boolean;
  unit: string;
  position: { top: string | number; left: string | number };
  contentWidth: string;
  fontSize: string;
  fontPx: number;
  type: 'book' | 'page' | 'section';
  book?: Book;
  pageTitle?: string;
  isRightPage?: boolean;
}

/**
 * Renders the running head (header) at the top of the page
 * 
 * Types:
 * - 'book': Shows book title on left page, author on right page
 * - 'page': Shows page title on both pages
 * - 'section': Shows section title on both pages
 */
export default function RunningHeadRenderer({
  show,
  isScreen,
  unit,
  position,
  contentWidth,
  fontSize,
  fontPx,
  type,
  book,
  pageTitle,
  isRightPage,
}: RunningHeadRendererProps) {
  if (!show) {
    return null;
  }

  const topStr = typeof position.top === 'number' 
    ? `${position.top}${unit}` 
    : position.top;
  const leftStr = typeof position.left === 'number' 
    ? `${position.left}${unit}` 
    : position.left;

  let content: React.ReactNode = null;

  if (type === 'book' && book) {
    content = !isRightPage ? (
      <>
        <span className="truncate">{book.title}</span>
        <span style={{ fontWeight: 300 }}>{book.author}</span>
      </>
    ) : (
      <>
        <span style={{ fontWeight: 300 }}>{book.author}</span>
        <span className="truncate">{book.title}</span>
      </>
    );
  } else if ((type === 'page' || type === 'section') && pageTitle) {
    content = pageTitle;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: topStr,
        left: leftStr,
        width: contentWidth,
        borderBottom: isScreen ? '1px solid rgba(0,0,0,0.1)' : '0.2mm solid rgba(0,0,0,0.12)',
        paddingBottom: isScreen ? '6px' : '1mm',
        display: type === 'book' ? 'flex' : 'block',
        justifyContent: type === 'book' ? 'space-between' : undefined,
        fontFamily: 'monospace',
        fontSize,
        letterSpacing: type === 'book' ? '0.12em' : '0.18em',
        textTransform: 'uppercase',
        opacity: type === 'book' ? 0.5 : 0.45,
      }}
    >
      {content}
    </div>
  );
}
