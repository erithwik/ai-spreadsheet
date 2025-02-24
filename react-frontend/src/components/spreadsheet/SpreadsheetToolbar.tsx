
import { Button } from '@/components/ui/button';
import { Plus, Save, Loader2 } from 'lucide-react';

interface SpreadsheetToolbarProps {
  onAddColumn: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export function SpreadsheetToolbar({ onAddColumn, onSave, isSaving }: SpreadsheetToolbarProps) {
  return (
    <div className="flex justify-between items-center p-4 bg-white border rounded-lg shadow-sm">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddColumn}
          className="text-gray-700 hover:text-gray-900"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Column
        </Button>
      </div>
      <Button
        variant="default"
        size="sm"
        onClick={onSave}
        disabled={isSaving}
        className="bg-gray-900 hover:bg-gray-800 text-white"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-1" />
        )}
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}
