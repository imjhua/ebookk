/**
 * 🚀 e-book-artisan 전체 초기화 (원클릭!)
 * 기존 데이터를 모두 삭제하고 깨끗한 상태로 초기화합니다
 */
function autoSetupEbookSheets() {
  Logger.log('🚀 e-book-artisan 전체 초기화 시작...');
  
  const SHEET_ID = '1gwvXdXGV8IEjQ5q82Fo9gEusW8k9ZVXVzQ6R_4iex24';
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // ===== 1. 시트 구조 정의 =====
  const sheetConfig = {
    'Metadata':    ['title', 'subtitle', 'author', 'theme', 'paperSize', 'margins', 'fontFamily', 'fontSize', 'lineHeight', 'showCropMarks', 'bleed', 'cover_showPageNumbers', 'cover_showRunningHead', 'toc_showPageNumbers', 'toc_showRunningHead', 'chapter_showPageNumbers', 'chapter_showRunningHead', 'body_showPageNumbers', 'body_showRunningHead', 'quote_showPageNumbers', 'quote_showRunningHead', 'sequence_showPageNumbers', 'sequence_showRunningHead', 'header-body_showPageNumbers', 'header-body_showRunningHead', 'blank_showPageNumbers', 'blank_showRunningHead'],
    'PageOrder':   ['id', 'pageType', 'orderIndex'],
    'Cover':       ['id', 'title', 'subtitle', 'author'],
    'TOC':         ['id', 'title', 'tocEntries_json'],
    'Chapter':     ['id', 'title', 'subtitle', 'content'],
    'Sequence':    ['id', 'title', 'content', 'items_json'],
    'Header-Body': ['id', 'title', 'content'],
    'Body':        ['id', 'content'],
    'Blank':       ['id', 'content'],
    'Quote':       ['id', 'title', 'content']
  };

  // ===== 2. 모든 시트 초기화 (생성 + 기존 데이터 삭제) =====
  Object.entries(sheetConfig).forEach(([sheetName, headers]) => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  });
  Logger.log('✅ 10개 시트 초기화 완료');

  // ===== 3. 샘플 데이터 (일괄 작성) =====
  const tocEntries = [
    { chapter: 'Chapter 01', title: '기본 호흡법', pageNumber: '5' },
    { chapter: 'Chapter 02', title: '워밍업', pageNumber: '12' },
    { chapter: 'Chapter 03', title: '플로우 시작', pageNumber: '18' }
  ];
  const sequenceItems = ['Mountain Pose', 'Forward Fold', 'Low Lunge', 'High Plank', 'Upward Dog', 'Downward Dog', 'Forward Fold', 'Mountain Pose'];
  const metadataMargins = JSON.stringify({top: 21, bottom: 21, inner: 21, outer: 15});

  const sampleData = {
    'Metadata':    [[
      '빈야사 플로우',                                    // title (0)
      'Vinyasa Flow',                                   // subtitle (1)
      '요기니 김지혜',                                   // author (2)
      'classic',                                        // theme (3)
      'a5',                                             // paperSize (4)
      metadataMargins,                                  // margins (5)
      'Noto Serif KR',                                  // fontFamily (6)
      10,                                               // fontSize (7)
      1.65,                                             // lineHeight (8)
      'TRUE',                                           // showCropMarks (9)
      3,                                                // bleed (10)
      'FALSE', 'FALSE',                                 // cover_showPageNumbers, cover_showRunningHead (11-12)
      'TRUE', 'FALSE',                                  // toc_showPageNumbers, toc_showRunningHead (13-14)
      'FALSE', 'FALSE',                                 // chapter_showPageNumbers, chapter_showRunningHead (15-16)
      'TRUE', 'TRUE',                                   // body_showPageNumbers, body_showRunningHead (17-18)
      'TRUE', 'TRUE',                                   // quote_showPageNumbers, quote_showRunningHead (19-20)
      'TRUE', 'TRUE',                                   // sequence_showPageNumbers, sequence_showRunningHead (21-22)
      'TRUE', 'TRUE',                                   // header-body_showPageNumbers, header-body_showRunningHead (23-24)
      'FALSE', 'FALSE'                                  // blank_showPageNumbers, blank_showRunningHead (25-26)
    ]],
    'Cover':       [['cover-row-2', '빈야사 플로우', 'Vinyasa Flow', '요기니 김지혜']],
    'TOC':         [['toc-row-2', '목차', JSON.stringify(tocEntries)]],
    'Chapter':     [
      ['chapter-row-2', 'CHAPTER 01', '기본 호흡법', '이 챕터에서는 요가의 기본이 되는 호흡법을 배웁니다.'],
      ['chapter-row-3', 'CHAPTER 02', '비니야사 플로우 기초', '비니야사 플로우의 기본 시퀀스와 흐름을 배웁니다.']
    ],
    'Sequence':    [['sequence-row-2', '태양 인사 A (Surya Namaskar A)', 'Surya Namaskar A 1\nMountain Pose\nForward Fold\nLow Lunge\nHigh Plank\nUpward Dog\nDownward Dog\nForward Fold\nMountain Pose', JSON.stringify(sequenceItems)]],
    'Header-Body': [['header-body-row-2', '기본 호흡법 (Pranayama)', '복식 호흡(Diaphragmatic Breathing)을 통해 신체와 마음이 연결되고, 현재의 순간에 더욱 집중할 수 있습니다. 요가를 시작하기 전에 항상 편안한 좌세에서 몇 분간 호흡을 관찰하고 집중하세요.']],
    'Body':        [['body-row-2', '요가 수련의 이점\n\n정기적인 요가 수련은 신체적, 정신적 건강을 증진시킵니다. 유연성 향상, 근력 강화, 스트레스 감소 등 다양한 이점이 있습니다.']],
    'Blank':       [['blank-row-2', '']],
    'Quote':       [['quote-row-2', '명언', '"요가는 단순한 운동이 아닙니다. 그것은 신체, 마음, 영혼의 통일입니다. 호흡을 통해 현재의 순간에 온전히 집중할 때, 우리는 진정한 자유를 경험합니다."']],
    'PageOrder':   [
      ['cover-row-2', 'cover', 0],
      ['toc-row-2', 'toc', 1],
      ['chapter-row-2', 'chapter', 2],
      ['body-row-2', 'body', 3],
      ['chapter-row-3', 'chapter', 4],
      ['sequence-row-2', 'sequence', 5],
      ['header-body-row-2', 'header-body', 6],
      ['blank-row-2', 'blank', 7],
      ['quote-row-2', 'quote', 8]
    ]
  };

  // ===== 4. 데이터 일괄 입력 =====
  Object.entries(sampleData).forEach(([sheetName, rows]) => {
    const sheet = ss.getSheetByName(sheetName);
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  });
  Logger.log('✅ 샘플 데이터 입력 완료');

  // ===== 5. 결과 =====
  Logger.log('\n✅ 전체 초기화 완료!\n' +
    '📋 10개 시트 초기화 + 샘플 데이터 입력\n' +
    '🔗 ' + 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit\n\n' +
    '⚠️ 다음 단계:\n' +
    '1. Apps Script에서 GAS_SCRIPT.gs 코드 붙여넣기\n' +
    '2. 배포 → 기존 배포 수정 → 배포\n' +
    '3. 브라우저 새로고침');
}
