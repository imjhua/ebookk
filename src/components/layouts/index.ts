/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Layout content components - refactored to be pure content renderers
 * Each component renders only the content area, delegating page frame/margins/theme to PageRenderer
 */

export { default as CoverLayoutContent } from './CoverLayoutContent';
export { default as TocLayoutContent } from './TocLayoutContent';
export { default as ChapterLayoutContent } from './ChapterLayoutContent';
export { default as BodyLayoutContent } from './BodyLayoutContent';
export { default as HeaderBodyLayoutContent } from './HeaderBodyLayoutContent';
export { default as QuoteLayoutContent } from './QuoteLayoutContent';
export { default as SequenceLayoutContent } from './SequenceLayoutContent';
export { default as BlankLayoutContent } from './BlankLayoutContent';

import type React from 'react';
import type { PageLayoutType } from '../../types';
import { LayoutContentProps } from '../layout-helpers';
import CoverLayoutContent from './CoverLayoutContent';
import TocLayoutContent from './TocLayoutContent';
import ChapterLayoutContent from './ChapterLayoutContent';
import BodyLayoutContent from './BodyLayoutContent';
import HeaderBodyLayoutContent from './HeaderBodyLayoutContent';
import QuoteLayoutContent from './QuoteLayoutContent';
import SequenceLayoutContent from './SequenceLayoutContent';
import BlankLayoutContent from './BlankLayoutContent';

/**
 * Layout content component map by layout type
 */
export const LAYOUT_CONTENT_MAP: Record<
  PageLayoutType,
  React.FC<LayoutContentProps>
> = {
  cover: CoverLayoutContent,
  toc: TocLayoutContent,
  chapter: ChapterLayoutContent,
  body: BodyLayoutContent,
  'header-body': HeaderBodyLayoutContent,
  quote: QuoteLayoutContent,
  sequence: SequenceLayoutContent,
  blank: BlankLayoutContent,
};

/**
 * Get layout content component by layout type
 * Falls back to body layout if type is not recognized
 */
export function getLayoutContentComponent(
  layoutType: PageLayoutType | string
): React.FC<LayoutContentProps> {
  return (
    LAYOUT_CONTENT_MAP[layoutType as PageLayoutType] ?? LAYOUT_CONTENT_MAP.body
  );
}
