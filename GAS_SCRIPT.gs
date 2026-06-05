// ====== Google Apps Script for e-book-artisan ======
// Deploy as Web App: Execute as Me, Anyone can access

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_NAMES = {
  metadata: 'Metadata',
  cover: 'Cover',
  toc: 'TOC',
  chapter: 'Chapter',
  sequence: 'Sequence',
  body: 'Body',
  blank: 'Blank',
  headerBody: 'Header-Body',
  quote: 'Quote'
};

// 기본값은 Metadata 시트에서 페이지 타입별로 관리됨

const PAGE_TYPE_SHEETS = {
  'cover': 'Cover',
  'toc': 'TOC',
  'chapter': 'Chapter',
  'sequence': 'Sequence',
  'header-body': 'Header-Body',
  'blank': 'Blank',
  'body': 'Body',
  'quote': 'Quote'
};

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = {};
    
    // 모든 시트를 한 번에 가져오기
    ss.getSheets().forEach(s => { sheets[s.getName()] = s; });
    
    // Load Metadata (27 columns: 11 base + 16 page-type-specific)
    const metadataSheet = sheets[SHEET_NAMES.metadata];
    const metadataRow = metadataSheet.getRange(2, 1, 1, 27).getValues()[0];
    const metadata = {
      title: metadataRow[0] || '',
      subtitle: metadataRow[1] || '',
      author: metadataRow[2] || '',
      theme: metadataRow[3] || 'classic',
      paperSize: metadataRow[4] || 'a5',
      margins: _parseMargins(metadataRow[5]) || { top: 21, bottom: 21, inner: 21, outer: 15 },
      fontFamily: metadataRow[6] || 'Noto Serif KR',
      fontSize: _parseNumber(metadataRow[7]) || 10,
      lineHeight: _parseNumber(metadataRow[8]) || 1.65,
      showCropMarks: _parseBoolean(metadataRow[9]) ?? true,
      bleed: _parseNumber(metadataRow[10]) || 3,
    };

    // Page type-specific visibility settings (from metadata columns 11-26)
    const pageTypeNames = ['cover', 'toc', 'chapter', 'body', 'quote', 'sequence', 'header-body', 'blank'];
    const pageTypeVisibility = {};
    pageTypeNames.forEach((pageType, idx) => {
      const baseCol = 11 + (idx * 2);
      pageTypeVisibility[pageType] = {
        showPageNumbers: _parseBoolean(metadataRow[baseCol]) ?? true,
        showRunningHead: _parseBoolean(metadataRow[baseCol + 1]) ?? true,
      };
    });
    
    // Add pageTypeVisibility to metadata for frontend
    metadata.pageTypeVisibility = pageTypeVisibility;

    // Load PageOrder (id, pageType, orderIndex only - 3 columns)
    const pageOrderMap = {};
    const pageOrderSheet = sheets['PageOrder'];
    if (pageOrderSheet && pageOrderSheet.getLastRow() > 1) {
      const orderData = pageOrderSheet.getRange(2, 1, pageOrderSheet.getLastRow() - 1, 3).getValues();
      for (let i = 0; i < orderData.length; i++) {
        if (orderData[i][0]) {
          pageOrderMap[orderData[i][0]] = {
            order: orderData[i][2] !== '' ? orderData[i][2] : i,
            pageType: orderData[i][1],
          };
        }
      }
    }

    // Load all pages from each PageType sheet
    let pages = [];
    
    Object.entries(PAGE_TYPE_SHEETS).forEach(([pageType, sheetName]) => {
      const sheet = sheets[sheetName];
      if (!sheet || sheet.getLastRow() <= 1) return;
      
      const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row[0] || row[0].toString().trim() === '') continue;
        
        const pageData = _rowToObject(pageType, row, i + 2);
        
        pages.push(pageData);
      }
    });

    // PageOrder 기준으로 정렬
    pages.sort((a, b) => {
      const orderA = pageOrderMap[a.id]?.order ?? 999;
      const orderB = pageOrderMap[b.id]?.order ?? 999;
      return orderA - orderB;
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      metadata: metadata,
      pages: pages
    }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // 요청 파싱
    let params;
    if (e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents);
    } else {
      throw new Error('No POST data received');
    }
    
    const { action, pageType, rowIndex, data } = params;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // ===== METADATA UPDATE =====
    if (action === 'updateMetadata') {
      const metadataSheet = ss.getSheetByName(SHEET_NAMES.metadata);
      const marginStr = typeof data.metadata.margins === 'string' 
        ? data.metadata.margins 
        : JSON.stringify(data.metadata.margins);
      
      // Build 27-column array
      const pageTypeNames = ['cover', 'toc', 'chapter', 'body', 'quote', 'sequence', 'header-body', 'blank'];
      const metadataValues = [
        data.metadata.title || '',
        data.metadata.subtitle || '',
        data.metadata.author || '',
        data.metadata.theme || 'classic',
        data.metadata.paperSize || 'a5',
        marginStr,
        data.metadata.fontFamily || 'Noto Serif KR',
        data.metadata.fontSize || 10,
        data.metadata.lineHeight || 1.65,
        data.metadata.showCropMarks ? 'TRUE' : 'FALSE',
        data.metadata.bleed || 3,
      ];
      
      // Add page-type-specific settings (columns 11-26)
      const pageTypeVisibility = data.metadata.pageTypeVisibility || {};
      pageTypeNames.forEach((pageType) => {
        const settings = pageTypeVisibility[pageType] || { showPageNumbers: true, showRunningHead: true };
        metadataValues.push(settings.showPageNumbers ? 'TRUE' : 'FALSE');
        metadataValues.push(settings.showRunningHead ? 'TRUE' : 'FALSE');
      });
      
      metadataSheet.getRange(2, 1, 1, 27).setValues([metadataValues]);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Metadata updated'
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ===== SYNC ALL (전체 동기화) =====
    if (action === 'syncAll') {
      const allPages = data.pages || [];
      const orderEntries = [];

      // 각 시트의 기존 데이터 삭제 후 새로 작성
      Object.entries(PAGE_TYPE_SHEETS).forEach(([pType, sName]) => {
        const s = ss.getSheetByName(sName);
        if (!s) return;
        if (s.getLastRow() > 1) {
          s.deleteRows(2, s.getLastRow() - 1);
        }
      });

      // 페이지 데이터 작성 + 순서 기록
      allPages.forEach((page, idx) => {
        const pType = page.layoutType;
        const sName = PAGE_TYPE_SHEETS[pType];
        if (!sName) return;
        const s = ss.getSheetByName(sName);
        if (!s) return;
        const rowValues = _objectToRow(pType, page);
        s.appendRow(rowValues);
        // PageOrder: only id, pageType, orderIndex (3 columns)
        orderEntries.push([page.id, pType, idx]);
      });

      // PageOrder 시트 갱신 (3 columns only)
      const pageOrderSheet = ss.getSheetByName('PageOrder');
      if (pageOrderSheet) {
        if (pageOrderSheet.getLastRow() > 1) {
          pageOrderSheet.deleteRows(2, pageOrderSheet.getLastRow() - 1);
        }
        if (orderEntries.length > 0) {
          pageOrderSheet.getRange(2, 1, orderEntries.length, 3).setValues(orderEntries);
        }
      }

      // Metadata 저장 (27 columns)
      if (data.metadata) {
        const metadataSheet = ss.getSheetByName(SHEET_NAMES.metadata);
        const marginStr = typeof data.metadata.margins === 'string' 
          ? data.metadata.margins 
          : JSON.stringify(data.metadata.margins);
        
        // Build 27-column array
        const pageTypeNames = ['cover', 'toc', 'chapter', 'body', 'quote', 'sequence', 'header-body', 'blank'];
        const metadataValues = [
          data.metadata.title || '',
          data.metadata.subtitle || '',
          data.metadata.author || '',
          data.metadata.theme || 'classic',
          data.metadata.paperSize || 'a5',
          marginStr,
          data.metadata.fontFamily || 'Noto Serif KR',
          data.metadata.fontSize || 10,
          data.metadata.lineHeight || 1.65,
          data.metadata.showCropMarks ? 'TRUE' : 'FALSE',
          data.metadata.bleed || 3,
        ];
        
        // Add page-type-specific settings (columns 11-26)
        const pageTypeVisibility = data.metadata.pageTypeVisibility || {};
        pageTypeNames.forEach((pageType) => {
          const settings = pageTypeVisibility[pageType] || { showPageNumbers: true, showRunningHead: true };
          metadataValues.push(settings.showPageNumbers ? 'TRUE' : 'FALSE');
          metadataValues.push(settings.showRunningHead ? 'TRUE' : 'FALSE');
        });
        
        metadataSheet.getRange(2, 1, 1, 27).setValues([metadataValues]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'All pages synced'
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ===== PAGE CRUD =====
    if (!PAGE_TYPE_SHEETS[pageType]) {
      throw new Error(`Invalid pageType: ${pageType}`);
    }

    const sheet = ss.getSheetByName(PAGE_TYPE_SHEETS[pageType]);
    if (!sheet) throw new Error(`Sheet not found: ${pageType}`);

    // DELETE
    if (action === 'delete' && rowIndex) {
      sheet.deleteRow(parseInt(rowIndex));
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Page deleted'
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // UPDATE
    if (action === 'update' && rowIndex && data) {
      const rowValues = _objectToRow(pageType, data);
      sheet.getRange(parseInt(rowIndex), 1, 1, rowValues.length).setValues([rowValues]);
      
      // Cover 업데이트 시 메타데이터도 동시 업데이트
      if (pageType === 'cover') {
        const metadataSheet = ss.getSheetByName(SHEET_NAMES.metadata);
        const metadataRow = metadataSheet.getRange(2, 1, 1, 27).getValues()[0];
        metadataRow[0] = data.title || metadataRow[0];     // title
        metadataRow[1] = data.subtitle || metadataRow[1];   // subtitle
        metadataRow[2] = data.author || metadataRow[2];     // author
        metadataSheet.getRange(2, 1, 1, 27).setValues([metadataRow]);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Page updated'
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // CREATE (SAVE)
    if (action === 'save' && data) {
      const rowValues = _objectToRow(pageType, data);
      sheet.appendRow(rowValues);
      
      // Cover 생성 시 메타데이터도 동시 업데이트
      if (pageType === 'cover') {
        const metadataSheet = ss.getSheetByName(SHEET_NAMES.metadata);
        const metadataRow = metadataSheet.getRange(2, 1, 1, 27).getValues()[0];
        metadataRow[0] = data.title || metadataRow[0];     // title
        metadataRow[1] = data.subtitle || metadataRow[1];   // subtitle
        metadataRow[2] = data.author || metadataRow[2];     // author
        metadataSheet.getRange(2, 1, 1, 27).setValues([metadataRow]);
      }
      
      // PageOrder 시트에도 새 페이지 추가 (3 columns only)
      const pageOrderSheet = ss.getSheetByName('PageOrder');
      if (pageOrderSheet) {
        const lastOrder = pageOrderSheet.getLastRow() - 1; // 헤더 제외
        const maxOrder = Math.max(0, lastOrder);
        pageOrderSheet.appendRow([data.id, pageType, maxOrder]);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Page created',
        data: data
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    throw new Error('Invalid action or missing parameters');

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== HELPER FUNCTIONS =====

function _rowToObject(pageType, row, rowIndex) {
  const obj = {
    id: row[0] || `${pageType}-row-${rowIndex}`,
    layoutType: pageType,
  };

  switch (pageType) {
    case 'cover':
      obj.title = row[1] || '';
      obj.subtitle = row[2] || '';
      obj.author = row[3] || '';
      break;
    case 'toc':
      obj.title = row[1] || '';
      try {
        obj.tocEntries = row[2] ? JSON.parse(row[2]) : [];
      } catch {
        obj.tocEntries = [];
      }
      break;
    case 'chapter':
      obj.title = row[1] || '';
      obj.subtitle = row[2] || '';
      obj.content = row[3] || '';
      break;
    case 'sequence':
      obj.title = row[1] || '';
      obj.content = row[2] || '';
      try {
        obj.items = row[3] ? JSON.parse(row[3]) : [];
      } catch {
        obj.items = [];
      }
      break;
    case 'body':
      obj.content = row[1] || '';
      break;
    case 'blank':
      obj.content = row[1] || '';
      break;
    case 'header-body':
      obj.title = row[1] || '';
      obj.content = row[2] || '';
      break;
    case 'quote':
      obj.title = row[1] || '';
      obj.content = row[2] || '';
      break;
  }

  return obj;
}

function _objectToRow(pageType, obj) {
  switch (pageType) {
    case 'cover':
      return [
        obj.id || '',
        obj.title || '',
        obj.subtitle || '',
        obj.author || ''
      ];
    case 'toc':
      return [
        obj.id || '',
        obj.title || '',
        obj.tocEntries ? JSON.stringify(obj.tocEntries) : '[]'
      ];
    case 'chapter':
      return [
        obj.id || '',
        obj.title || '',
        obj.subtitle || '',
        obj.content || ''
      ];
    case 'sequence':
      return [
        obj.id || '',
        obj.title || '',
        obj.content || '',
        obj.items ? JSON.stringify(obj.items) : '[]'
      ];
    case 'body':
      return [
        obj.id || '',
        obj.content || ''
      ];
    case 'blank':
      return [
        obj.id || '',
        obj.content || ''
      ];
    case 'header-body':
      return [
        obj.id || '',
        obj.title || '',
        obj.content || ''
      ];
    case 'quote':
      return [
        obj.id || '',
        obj.title || '',
        obj.content || ''
      ];
  }
}

// ===== PARSING HELPERS =====



function _parseMargins(value) {
  if (!value) return null;
  try {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  } catch {
    return null;
  }
}

function _parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

function _parseBoolean(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return !!value;
}
