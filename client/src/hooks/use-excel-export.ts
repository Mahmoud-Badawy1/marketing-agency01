import * as XLSX from 'xlsx';

export interface ExcelColumn<T> {
  key: keyof T | string;
  header: string;
  formatter?: (value: any, item: T) => string | number;
}

/**
 * Generic utility to export a JSON array to an Excel file
 */
export function exportToExcel<T>(data: T[], columns: ExcelColumn<T>[], filename: string) {
  // Format the data according to the provided columns
  const formattedData = data.map(item => {
    const row: Record<string, string | number> = {};
    columns.forEach(col => {
      const val = (item as any)[col.key];
      row[col.header] = col.formatter ? col.formatter(val, item) : (val !== null && val !== undefined ? val : '-');
    });
    return row;
  });

  // Create a worksheet
  const ws = XLSX.utils.json_to_sheet(formattedData);

  // Auto-size columns based on the longest string in each column
  const colWidths = columns.map(col => {
    const headerLen = col.header.length;
    const maxContentLen = formattedData.reduce((max, row) => {
      const val = String(row[col.header] || '');
      return Math.max(max, val.length);
    }, 0);
    // Add extra padding for Arabic characters (they are wider)
    return { wch: Math.max(headerLen, maxContentLen) + 5 };
  });
  
  ws['!cols'] = colWidths;

  // Set Right-to-Left writing direction for Arabic
  ws['!dir'] = 'rtl';

  // Create a workbook and append the sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
  // Set RTL on workbook level (supported by some spreadsheet apps)
  if (!wb.Workbook) wb.Workbook = { Views: [{ RTL: true }] };

  // Write and download the file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
