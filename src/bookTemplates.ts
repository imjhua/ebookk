/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book } from './types';

export const BOOKS_TEMPLATES: Book[] = [
  {
    id: 'my-story',
    title: '나만의 책 쓰기',
    author: '작가명 입력',
    subtitle: '나만의 이야기가 책으로 인쇄되는 기적',
    publisher: '독립출판 워크숍',
    coverStyle: 'minimal',
    coverTheme: 'terracotta',
    pages: [
      {
        id: 'p-1',
        layoutType: 'title',
        content: '나만의 책 쓰기',
      },
      {
        id: 'p-2',
        layoutType: 'body',
        content: '이곳에 마우스를 클릭해 나만의 책 내용을 입력해 보세요.\n\n왼쪽 패널의 [집필실] 탭에서는 여백, 본문 크기, 책의 사이즈를 실시간으로 조절할 수 있습니다.\n\n[화면 보정] 메뉴를 이용하면 당신의 모니터 해상도에 맞게 신용카드 크기를 대조하여 실제 인쇄될 실제 책 크기와 1:1 비율로 화면에 띄울 수 있습니다.',
      },
      {
        id: 'p-3',
        layoutType: 'body',
        content: '인쇄를 원할 때는 언제든지 상단의 [프린트하기] 버튼을 눌러보세요.\n\n모든 편집 인터페이스와 웹 메뉴들이 말끔하게 숨겨지고, 오직 책 레이아웃만 남긴 채 브라우저 인쇄 창이 열립니다.\n\n우측 레이아웃 보기 혹은 스프레드 뷰(양면 보기)로 제본에 적합한 책을 직접 제작할 수 있습니다.',
      },
    ],
  },
];
