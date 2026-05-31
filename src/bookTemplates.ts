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
    theme: 'classic',
    pages: [
      { id: 'p-1',  layoutType: 'cover',   content: '나만의 책 쓰기', title: '' },
      { id: 'p-2',  layoutType: 'toc',     content: 'CHAPTER 01  ···  3\nCHAPTER 02  ···  6\nCHAPTER 03  ···  9', title: '목차' },
      { id: 'p-3',  layoutType: 'chapter', content: '', title: 'CHAPTER 01' },
      { id: 'p-4',  layoutType: 'body',    content: '이곳에 마우스를 클릭해 나만의 책 내용을 입력해 보세요.\n\n왼쪽 패널의 Document Structure에서 페이지를 선택하고, 우측 패널에서 여백, 본문 크기, 책의 사이즈를 실시간으로 조절할 수 있습니다.', title: '' },
      { id: 'p-5',  layoutType: 'quote',   content: '글을 쓴다는 것은\n세상에 자신의 방을 만드는 일이다.', title: '' },
      { id: 'p-6',  layoutType: 'chapter', content: '', title: 'CHAPTER 02' },
      { id: 'p-7',  layoutType: 'body',    content: '인쇄를 원할 때는 언제든지 우측 패널의 [인쇄 창 호출] 버튼을 눌러보세요.\n\n모든 편집 인터페이스와 웹 메뉴들이 말끔하게 숨겨지고, 오직 책 레이아웃만 남긴 채 브라우저 인쇄 창이 열립니다.', title: '' },
      { id: 'p-8',  layoutType: 'chapter', content: '', title: 'CHAPTER 03' },
      { id: 'p-9',  layoutType: 'body',    content: '양면 보기(스프레드 뷰)로 제본에 적합한 책을 직접 제작할 수 있습니다.\n\n독립출판의 세계에 오신 것을 환영합니다.', title: '' },
      { id: 'p-10', layoutType: 'quote',   content: '책은 꿈을 담는 가장 오래된 그릇이다.', title: '' },
    ],
  },
];
