
export interface CellPosition {
  row: number;
  col: number;
}

export interface CellSelection {
  start: CellPosition | null;
  end: CellPosition | null;
}

export interface CellSourceInfo {
  row: number;
  col: number;
}
