
import { Button } from '@/components/ui/button';
import { GripVertical, Wand2 } from 'lucide-react';
import { Resizable } from 'react-resizable';
import { Draggable } from '@hello-pangea/dnd';

interface SpreadsheetHeaderProps {
  column: string;
  columnIndex: number;
  width: number;
  isIndexColumn: boolean;
  onResize: (columnIndex: number, size: { width: number }) => void;
  onAutofillIndex: () => void;
}

export function SpreadsheetHeader({
  column,
  columnIndex,
  width,
  isIndexColumn,
  onResize,
  onAutofillIndex
}: SpreadsheetHeaderProps) {
  return (
    <Draggable 
      key={column} 
      draggableId={column} 
      index={columnIndex}
      isDragDisabled={isIndexColumn}
    >
      {(provided) => (
        <th
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="p-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200 relative group cursor-move"
          style={{ width, ...provided.draggableProps.style }}
        >
          <Resizable
            width={width}
            height={40}
            onResize={(e, { size }) => onResize(columnIndex, size)}
            draggableOpts={{ enableUserSelectHack: false }}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 absolute left-0 cursor-move" />
              <span className="ml-6 text-gray-700">{column}</span>
              {isIndexColumn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAutofillIndex}
                  className="ml-auto"
                  title="Autofill Index Column"
                >
                  <Wand2 className="h-4 w-4 text-gray-500" />
                </Button>
              )}
            </div>
          </Resizable>
        </th>
      )}
    </Draggable>
  );
}
