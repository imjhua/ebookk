# ebookk

**전문 eBook 에디터 - 인쇄용 전자책 제작 도구**

책 프로젝트를 구성하고, 다양한 페이지 레이아웃으로 편집한 후 인쇄용 PDF로 내보낼 수 있습니다.

## 📚 영역 용어 정리

eBook 제작 시 페이지 영역과 레이아웃을 정확히 이해하기 위한 기본 용어입니다.

### 1. 페이지 여백 (Margins & Bleed)

페이지의 콘텐츠 배치를 제어하는 4방향 여백과 인쇄 안전 간격:

```typescript
// Margins: 콘텐츠가 들어갈 수 있는 영역
{
  top: number,      // 위쪽 (제목/러닝헤드 영역)
  bottom: number,   // 아래쪽 (쪽번호 영역)
  inner: number,    // 안쪽 (제본 쪽, 좌/우 중 안쪽)
  outer: number     // 바깥쪽 (자유 쪽, 좌/우 중 바깥쪽)
}

// Bleed: 재단 오차를 고려한 안전 거리 (기본값: 3mm)
// 인쇄 시 재단선을 넘어도 끊기지 않도록 함
```

**계산식:**

- **Content Width** = 용지너비 − inner − outer
- **Running Head Top** = top margin / 2.5

### 2. 페이지 추가 요소

인쇄된 책에 추가로 표시되는 요소들:

| 요소 | 설정 | 위치 | 용도 |
|------|------|------|------|
| **Crop Marks** (재단선) | `showCropMarks` | 4개 코너 (L자 모양) | 인쇄소의 정확한 절단 가이드 |
| **Page Numbers** (쪽번호) | `showPageNumbers` | 하단 바깥쪽 끝 | 페이지 번호 표시 |
| **Running Head** (러닝헤드) | `showRunningHead` | 상단 여백 내 | 책제목/챕터명 반복 표시 |

각 요소는 **페이지 타입별로 개별 제어** 가능합니다 (예: 표지는 쪽번호 숨김, 본문은 표시).

### 3. 페이지 레이아웃 타입 (8가지)

각 페이지는 용도에 따라 다른 타입으로 지정됩니다:

| 타입 | 한글명 | 주요 콘텐츠 | 특징 |
|------|--------|-----------|------|
| `cover` | 표지 | 제목, 저자, 부제목 | 중앙 배치, 풀페이지 배경 가능 |
| `toc` | 목차 | 챕터 카드 나열 | 그리드 레이아웃 |
| `chapter` | 챕터 제목 | 큼직한 제목 | PART 표시, 여백으로 강조 |
| `body` | 본문 | 글 내용 | drop cap + running head 포함 |
| `header-body` | 제목+본문 | 섹션 제목 + 본문 텍스트 | 두 요소 동시 배치 |
| `quote` | 인용구 | 이탤릭 텍스트 | 시적/명언 표현, 중앙 정렬 |
| `sequence` | 시퀀스 | 좌우 정렬 텍스트 | 시 형식, running head 포함 |
| `blank` | 빈페이지 | (없음) | 디자인 여백용, 쪽번호만 선택적 표시 |

### 4. 콘텐츠 영역 정의

```
Content Area (콘텐츠 영역)
= (페이지 너비 − inner margin − outer margin) 
  × (페이지 높이 − top margin − bottom margin)
```

- **Print Surface**: 여백 포함 전체 페이지
- **Viewport**: 사용자가 보는 화면 (scale 배수로 동적 조절 가능)

### 5. 용지 규격 (5가지 프리셋)

| ID | 이름 | 크기 | 권장 용도 |
|----|------|------|---------|
| `a5` | A5 | 148×210 mm | **소설, 수필** (가장 일반적) |
| `b6` | B6 | 128×182 mm | **시집, 에세이** |
| `pocket` | 포켓 신국판 | 108×175 mm | **문고판** (한 손 사이즈) |
| `singuk` | 신국판 | 152×225 mm | **학술서, 전문 서적** |
| `a4` | A4 | 210×297 mm | **대형 기술서, 화보** |

### 6. 렌더링 모드: Screen vs Print

화면과 인쇄 환경에서 다르게 표현됩니다:

| 항목 | Screen 모드 | Print 모드 |
|------|-----------|----------|
| 단위 | **px** (픽셀) | **mm** (밀리미터) |
| 폰트 크기 | px | pt (포인트) |
| 여백 표시 | 회색 배경 영역 | 흰색 (실제 용지) |
| 재단선 | 검정 가는 선 | 인쇄될 선 |
| 스케일 | 사용자 조절 가능 | 고정 (100%) |

### 7. 좌표 개념 (Inner/Outer)

⚠️ **중요: Inner/Outer는 좌/우가 아닙니다!**

- **Inner**: 제본 쪽 (양쪽 페이지 모두 가운데)
- **Outer**: 자유 쪽 (양쪽 페이지 모두 바깥쪽)

예시:

```
좌측 페이지 (짝수)      우측 페이지 (홀수)
  inner | outer           outer | inner
  (중앙) (바깥쪽)        (바깥쪽) (중앙)
```

이렇게 정의하면 좌우 페이지가 **자동으로 대칭**됩니다! ✅

### 8. 설정 체계

**BookProject** (프로젝트 전체)

- 메타데이터: title, author, theme
- 레이아웃: paperSize, margins, bleed
- 타이포그래피: fontFamily, fontSize, lineHeight
- 시각화: showCropMarks, showPageNumbers, showRunningHead
- 페이지타입 제어: pageTypeVisibility[layoutType]

**PrintSettings** (인쇄 서식)

- BookProject의 부분 집합
- 실제 렌더링에 사용되는 설정들
- 메타데이터에서 Google Sheets로 동기화됨

---

## 📖 Google Sheets 연동

자세한 설정 방법은 [GAS_INSTRUCTIONS.md](GAS_INSTRUCTIONS.md) 참고
