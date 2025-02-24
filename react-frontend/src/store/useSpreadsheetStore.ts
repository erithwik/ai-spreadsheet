import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface SheetData {
  id: string;
  title: string;
  description: string;
  indexColumn: string;
  columns: string[];
  data: string[][];
  sources: string[][];
}

interface SpreadsheetState {
  sheets: SheetData[];
  activeSheetId: string | null;
  isLoading: boolean;
  setSheets: (sheets: SheetData[]) => void;
  addSheet: (title: string, description: string, columns: string[], indexColumn: string) => void;
  setActiveSheet: (id: string) => void;
  updateCell: (sheetId: string, rowIndex: number, colIndex: number, value: string, source?: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useSpreadsheetStore = create<SpreadsheetState>((set) => ({
  sheets: [],
  activeSheetId: null,
  isLoading: true,
  setSheets: (sheets) => set({ sheets, isLoading: false }),
  addSheet: (title, description, columns, indexColumn) => {
    const newSheet: SheetData = {
      id: uuidv4(),
      title,
      description,
      indexColumn,
      columns,
      data: Array(10).fill(Array(columns.length).fill('')),
      sources: Array(10).fill(Array(columns.length).fill(''))
    };

    set((state) => ({
      sheets: [...state.sheets, newSheet],
      activeSheetId: newSheet.id
    }));
  },
  setActiveSheet: (id) => set({ activeSheetId: id }),
  updateCell: (sheetId, rowIndex, colIndex, value, source) => {
    set((state) => ({
      sheets: state.sheets.map((sheet) => {
        if (sheet.id !== sheetId) return sheet;
        
        const newData = [...sheet.data];
        const newSources = [...sheet.sources];
        
        if (!newData[rowIndex]) {
          newData[rowIndex] = Array(sheet.columns.length).fill('');
          newSources[rowIndex] = Array(sheet.columns.length).fill('');
        }
        
        newData[rowIndex] = [...newData[rowIndex]];
        newData[rowIndex][colIndex] = value;
        
        if (source) {
          newSources[rowIndex] = [...newSources[rowIndex]];
          newSources[rowIndex][colIndex] = source;
        }
        
        return {
          ...sheet,
          data: newData,
          sources: newSources
        };
      })
    }));
  },
  setLoading: (loading) => set({ isLoading: loading })
}));
