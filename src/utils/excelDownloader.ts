import * as XLSX from 'xlsx';
import { ExcelPreviewData } from './excelGenerator';

/**
 * Downloads the Excel preview data as an Excel file
 * @param excelData - The Excel preview data to download
 * @param filename - Optional filename (defaults to 'export.xlsx')
 * @param columnOrder - Optional array of column indices defining the order (defaults to original order)
 * @param visibleColumns - Optional Set of visible column indices (all columns included if not provided)
 */
export const downloadExcelSheet = (
  excelData: ExcelPreviewData | null,
  filename: string = 'export.xlsx',
  columnOrder?: number[],
  visibleColumns?: Set<number>
): void => {
  // Validate that excelData is not null and has data
  if (!excelData || excelData.headers.length === 0 || excelData.rows.length === 0) {
    console.warn('No Excel data available to download');
    return;
  }

  try {
    // Determine which columns to include and their order
    let columnsToExport: number[];
    
    if (columnOrder && columnOrder.length > 0) {
      // Use provided column order
      columnsToExport = columnOrder;
    } else {
      // Use original order (0, 1, 2, ...)
      columnsToExport = Array.from({ length: excelData.headers.length }, (_, i) => i);
    }

    // Filter to only visible columns if visibility info is provided
    if (visibleColumns && visibleColumns.size > 0) {
      columnsToExport = columnsToExport.filter(colIndex => visibleColumns.has(colIndex));
    }

    // Build headers in the specified order
    const orderedHeaders = columnsToExport.map(colIndex => excelData.headers[colIndex]);

    // Build rows in the specified column order
    const orderedRows = excelData.rows.map(row => 
      columnsToExport.map(colIndex => row[colIndex])
    );

    // Prepare data array with headers as first row
    const data: Array<Array<string | number>> = [
      orderedHeaders, // First row: headers in specified order
      ...orderedRows  // Subsequent rows: data in specified column order
    ];

    // Convert array of arrays to worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Add worksheet to workbook with sheet name
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    throw new Error('Failed to generate Excel file');
  }
};

