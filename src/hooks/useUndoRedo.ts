/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, useCallback } from 'react';
import { Book } from '../types';

interface UndoRedoState {
  past: Book[];
  present: Book;
  future: Book[];
}

interface UseUndoRedoReturn {
  undo: () => Book | null;
  redo: () => Book | null;
  pushState: (newState: Book) => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

const MAX_HISTORY_SIZE = 10;

/**
 * 페이지 편집 작업(삭제, 드래그앤드롭)의 히스토리 관리 훅
 * useRef를 통해 history를 직접 관리하므로 불필요한 재초기화가 없습니다.
 * 
 * @param initialBook - 초기 Book 상태
 * @returns UndoRedo 인터페이스
 */
export function useUndoRedo(initialBook: Book | null): UseUndoRedoReturn {
  // useRef를 사용해서 history를 직접 관리 (컴포넌트 리렌더링 시 유지)
  const historyRef = useRef<UndoRedoState>({
    past: [],
    present: initialBook || {
      id: '',
      title: '',
      author: '',
      theme: 'classic',
      pages: [],
    },
    future: [],
  });

  // 상태 업데이트 감지용 (canUndo, canRedo 반영)
  const [, setHistoryVersion] = useState(0);

  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  const pushState = useCallback((newState: Book) => {
    const prev = historyRef.current;
    const newPast = [...prev.past, prev.present];
    
    // 최대 히스토리 크기 유지
    if (newPast.length > MAX_HISTORY_SIZE) {
      newPast.shift();
    }

    historyRef.current = {
      past: newPast,
      present: newState,
      future: [], // 새로운 작업 시 Redo 스택 초기화
    };
    
    // UI 업데이트 강제
    setHistoryVersion((v) => v + 1);
  }, []);

  const undo = useCallback(() => {
    const prev = historyRef.current;
    if (prev.past.length === 0) return null;

    const newPast = [...prev.past];
    const newPresent = newPast.pop()!;
    const newFuture = [prev.present, ...prev.future];

    historyRef.current = {
      past: newPast,
      present: newPresent,
      future: newFuture,
    };

    // UI 업데이트 강제
    setHistoryVersion((v) => v + 1);
    
    return newPresent;
  }, []);

  const redo = useCallback(() => {
    const prev = historyRef.current;
    if (prev.future.length === 0) return null;

    const newFuture = [...prev.future];
    const newPresent = newFuture.shift()!;
    const newPast = [...prev.past, prev.present];

    historyRef.current = {
      past: newPast,
      present: newPresent,
      future: newFuture,
    };

    // UI 업데이트 강제
    setHistoryVersion((v) => v + 1);
    
    return newPresent;
  }, []);

  const clear = useCallback(() => {
    historyRef.current = {
      past: [],
      present: historyRef.current.present,
      future: [],
    };
    
    setHistoryVersion((v) => v + 1);
  }, []);

  return {
    undo,
    redo,
    pushState,
    canUndo,
    canRedo,
    clear,
  };
}
