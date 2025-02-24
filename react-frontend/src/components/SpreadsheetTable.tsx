import { useState, useRef, useEffect } from 'react';
import { useSpreadsheetStore, SheetData } from '@/store/useSpreadsheetStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { SpreadsheetToolbar } from './spreadsheet/SpreadsheetToolbar';
import { SpreadsheetCell } from './spreadsheet/SpreadsheetCell';
import { SpreadsheetHeader } from './spreadsheet/SpreadsheetHeader';
import { AutofillButton } from './spreadsheet/AutofillButton';
import { CellPosition, CellSelection, CellSourceInfo } from '@/types/spreadsheet';
import { apiService } from '@/services/api';

interface SpreadsheetTableProps {
  sheet: SheetData;
}

export function SpreadsheetTable({ sheet }: SpreadsheetTableProps) {
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showSources, setShowSources] = useState<CellSourceInfo | null>(null);
  const [showAutofillModal, setShowAutofillModal] = useState(false);
  const [autofillCount, setAutofillCount] = useState(10);
  const [columnWidths, setColumnWidths] = useState<number[]>(sheet.columns.map(() => 200));
  const [selectedCells, setSelectedCells] = useState<CellSelection>({
    start: null,
    end: null
  });
  const [isDragging, setIsDragging] = useState(false);
  const [showSourceEditModal, setShowSourceEditModal] = useState(false);
  const [editingSource, setEditingSource] = useState('');
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  const updateCell = useSpreadsheetStore(state => state.updateCell);

  const handleCellEdit = (row: number, col: number, value: string) => {
    setEditingCell({ row, col });
    setEditValue(value);
  };

  const handleCellClick = (row: number, col: number, value: string) => {
    if (!isDragging) {
      handleCellEdit(row, col, value);
    }
  };

  const handleSaveEdit = async () => {
    if (editingCell) {
      if (editValue !== sheet.data[editingCell.row][editingCell.col]) {
        updateCell(sheet.id, editingCell.row, editingCell.col, editValue);
        if (sheet.columns[editingCell.col] !== sheet.indexColumn) {
          setShowSourceEditModal(true);
          setEditingSource('');
        } else {
          setEditingCell(null);
        }
      } else {
        setEditingCell(null);
      }
    }
  };

  const handleSaveSource = () => {
    if (editingCell && editingSource) {
      updateCell(sheet.id, editingCell.row, editingCell.col, editValue, editingSource);
    }
    setShowSourceEditModal(false);
    setEditingCell(null);
  };

  const handleAutofillIndex = () => {
    setShowAutofillModal(true);
  };

  const handleConfirmAutofill = async () => {
    const values = await apiService.autofillIndexColumn({
      description: sheet.description,
      col_name: sheet.indexColumn,
      max_count: autofillCount
    });

    values.forEach((value, row) => {
      const colIndex = sheet.columns.indexOf(sheet.indexColumn);
      if (colIndex !== -1) {
        updateCell(sheet.id, row, colIndex, value);
      }
    });

    setShowAutofillModal(false);
  };

  const handleAddRow = () => {
    const newRow = Array(sheet.columns.length).fill('');
    updateCell(sheet.id, sheet.data.length, 0, '');
  };

  const handleAddColumn = () => {
    if (newColumnName && !sheet.columns.includes(newColumnName)) {
      const newColumns = [...sheet.columns, newColumnName];
      const newData = sheet.data.map(row => [...row, '']);
      const newSources = sheet.sources.map(row => [...(row || []), '']);
      sheet.columns = newColumns;
      sheet.data = newData;
      sheet.sources = newSources;
      setColumnWidths([...columnWidths, 200]);
      setShowAddColumnModal(false);
      setNewColumnName('');
    }
  };

  const onResize = (columnIndex: number, size: { width: number }) => {
    const newWidths = [...columnWidths];
    newWidths[columnIndex] = size.width;
    setColumnWidths(newWidths);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceIndex = source.index;
    const destIndex = destination.index;

    const newColumns = Array.from(sheet.columns);
    const [reorderedColumn] = newColumns.splice(sourceIndex, 1);
    newColumns.splice(destIndex, 0, reorderedColumn);

    const newData = sheet.data.map(row => {
      const newRow = Array.from(row);
      const [reorderedCell] = newRow.splice(sourceIndex, 1);
      newRow.splice(destIndex, 0, reorderedCell);
      return newRow;
    });

    const newSources = sheet.sources.map(row => {
      if (!row) return row;
      const newRow = Array.from(row);
      const [reorderedSource] = newRow.splice(sourceIndex, 1);
      newRow.splice(destIndex, 0, reorderedSource);
      return newRow;
    });

    const newWidths = Array.from(columnWidths);
    const [reorderedWidth] = newWidths.splice(sourceIndex, 1);
    newWidths.splice(destIndex, 0, reorderedWidth);

    sheet.columns = newColumns;
    sheet.data = newData;
    sheet.sources = newSources;
    setColumnWidths(newWidths);
  };

  const handleMouseDown = (row: number, col: number) => {
    if (!isDragging) {
      setSelectedCells({ start: { row, col }, end: { row, col } });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (row: number, col: number) => {
    if (isDragging && selectedCells.start) {
      setSelectedCells({ ...selectedCells, end: { row, col } });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleAutofillSelection = async () => {
    if (!selectedCells.start || !selectedCells.end) return;
    setIsAutofilling(true);

    try {
      const startRow = Math.min(selectedCells.start.row, selectedCells.end.row);
      const endRow = Math.max(selectedCells.start.row, selectedCells.end.row);
      const startCol = Math.min(selectedCells.start.col, selectedCells.end.col);
      const endCol = Math.max(selectedCells.start.col, selectedCells.end.col);

      for (let row = startRow; row <= endRow; row++) {
        const indexValue = sheet.data[row][sheet.columns.indexOf(sheet.indexColumn)];
        const { values, sources } = await apiService.autofillCells({
          description: sheet.description,
          columns: sheet.columns.slice(startCol, endCol + 1),
          index_value: indexValue
        });

        values.forEach((value, colOffset) => {
          const col = startCol + colOffset;
          if (col !== sheet.columns.indexOf(sheet.indexColumn)) {
            updateCell(sheet.id, row, col, value, sources[colOffset]);
          }
        });
      }

      setSelectedCells({ start: null, end: null });
    } finally {
      setIsAutofilling(false);
    }
  };

  const handleSaveSpreadsheet = async () => {
    setIsSaving(true);
    try {
      await apiService.saveSpreadsheet({
        id: sheet.id,
        sheet: {
          ...sheet,
          columnWidths
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const ensureIndexColumnFirst = () => {
    if (!sheet.indexColumn) return;
    
    const indexColIndex = sheet.columns.indexOf(sheet.indexColumn);
    if (indexColIndex > 0) {
      const newColumns = [sheet.columns[indexColIndex], ...sheet.columns.filter((_, i) => i !== indexColIndex)];
      const newData = sheet.data.map(row => [row[indexColIndex], ...row.filter((_, i) => i !== indexColIndex)]);
      const newSources = sheet.sources.map(row => [row[indexColIndex], ...row.filter((_, i) => i !== indexColIndex)]);
      const newWidths = [columnWidths[indexColIndex], ...columnWidths.filter((_, i) => i !== indexColIndex)];
      
      sheet.columns = newColumns;
      sheet.data = newData;
      sheet.sources = newSources;
      setColumnWidths(newWidths);
    }
  };

  useEffect(() => {
    ensureIndexColumnFirst();
  }, [sheet.indexColumn]);

  return (
    <div className="space-y-4 font-sans">
      <SpreadsheetToolbar
        onAddColumn={() => setShowAddColumnModal(true)}
        onSave={handleSaveSpreadsheet}
        isSaving={isSaving}
      />

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <table 
              ref={tableRef}
              className="w-full border-collapse"
              onMouseLeave={handleMouseUp}
            >
              <thead>
                <Droppable droppableId="columns" direction="horizontal">
                  {(provided) => (
                    <tr className="bg-gray-50" ref={provided.innerRef} {...provided.droppableProps}>
                      {sheet.columns.map((column, columnIndex) => (
                        <SpreadsheetHeader
                          key={column}
                          column={column}
                          columnIndex={columnIndex}
                          width={columnWidths[columnIndex]}
                          isIndexColumn={column === sheet.indexColumn}
                          onResize={(columnIndex, size) => onResize(columnIndex, size)}
                          onAutofillIndex={handleAutofillIndex}
                        />
                      ))}
                      {provided.placeholder}
                    </tr>
                  )}
                </Droppable>
              </thead>
              <tbody>
                {sheet.data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell, colIndex) => (
                      <SpreadsheetCell
                        key={`${rowIndex}-${colIndex}`}
                        value={cell}
                        isEditing={editingCell?.row === rowIndex && editingCell?.col === colIndex}
                        isSelected={
                          selectedCells.start && selectedCells.end && 
                          rowIndex >= Math.min(selectedCells.start.row, selectedCells.end.row) &&
                          rowIndex <= Math.max(selectedCells.start.row, selectedCells.end.row) &&
                          colIndex >= Math.min(selectedCells.start.col, selectedCells.end.col) &&
                          colIndex <= Math.max(selectedCells.start.col, selectedCells.end.col)
                        }
                        hasSource={!!sheet.sources[rowIndex]?.[colIndex]}
                        editValue={editValue}
                        width={columnWidths[colIndex]}
                        position={{ row: rowIndex, col: colIndex }}
                        onEdit={setEditValue}
                        onSave={handleSaveEdit}
                        onClick={() => handleCellClick(rowIndex, colIndex, cell)}
                        onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                        onMouseMove={() => handleMouseMove(rowIndex, colIndex)}
                        onMouseUp={handleMouseUp}
                        onShowSource={() => setShowSources({ row: rowIndex, col: colIndex })}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </DragDropContext>
        </div>
        <Button
          variant="ghost"
          size="lg"
          onClick={handleAddRow}
          className="w-full border-t rounded-none hover:bg-gray-50 h-12 text-gray-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Row
        </Button>
      </div>

      {selectedCells.start && selectedCells.end && (
        <AutofillButton 
          onClick={handleAutofillSelection}
          isLoading={isAutofilling}
        />
      )}

      <Dialog
        open={showSources !== null}
        onOpenChange={() => setShowSources(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Source Information</DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-gray-700 max-h-[60vh] overflow-y-auto whitespace-pre-wrap break-words">
            {showSources && sheet.sources[showSources.row]?.[showSources.col]}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAutofillModal}
        onOpenChange={setShowAutofillModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Autofill Index Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Number of rows to generate
              </label>
              <Input
                type="number"
                value={autofillCount}
                onChange={(e) => setAutofillCount(parseInt(e.target.value))}
                min={1}
                max={100}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAutofillModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAutofill}
              className="bg-gray-900 hover:bg-gray-700 text-white"
            >
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showSourceEditModal}
        onOpenChange={setShowSourceEditModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Source</label>
              <Input
                value={editingSource}
                onChange={(e) => setEditingSource(e.target.value)}
                placeholder="Enter source information"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSourceEditModal(false)}>
              Skip
            </Button>
            <Button 
              onClick={handleSaveSource}
              className="bg-gray-900 hover:bg-gray-700 text-white"
            >
              Save Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAddColumnModal}
        onOpenChange={setShowAddColumnModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Column Name</label>
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Enter column name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddColumnModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddColumn}
              className="bg-gray-900 hover:bg-gray-700 text-white"
            >
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
