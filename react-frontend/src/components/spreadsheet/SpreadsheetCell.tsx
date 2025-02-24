
import { Info } from 'lucide-react';
import { CellPosition } from '@/types/spreadsheet';

interface SpreadsheetCellProps {
  value: string;
  isEditing: boolean;
  isSelected: boolean;
  hasSource: boolean;
  editValue?: string;
  width: number;
  position: CellPosition;
  onEdit: (value: string) => void;
  onSave: () => void;
  onClick: () => void;
  onMouseDown: () => void;
  onMouseMove: () => void;
  onMouseUp: () => void;
  onShowSource: () => void;
}

export function SpreadsheetCell({
  value,
  isEditing,
  isSelected,
  hasSource,
  editValue = '',
  width,
  onEdit,
  onSave,
  onClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onShowSource
}: SpreadsheetCellProps) {
  return (
    <td
      className={`p-3 border-b border-gray-200 transition-colors h-auto ${
        isSelected ? 'bg-gray-100' : ''
      }`}
      style={{ width, maxWidth: width }}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {isEditing ? (
        <textarea
          value={editValue}
          onChange={(e) => onEdit(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSave()}
          autoFocus
          className="w-full min-h-[30px] bg-transparent outline-none border-none p-0 focus:ring-0 resize-none overflow-hidden"
          style={{ height: 'auto' }}
        />
      ) : (
        <div className="flex items-start gap-2 min-h-[30px] break-words">
          <span className="text-gray-900 w-full cursor-text whitespace-pre-wrap">
            {value}
          </span>
          {hasSource && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowSource();
              }}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-1"
            >
              <Info className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </td>
  );
}
