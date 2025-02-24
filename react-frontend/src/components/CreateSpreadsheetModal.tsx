
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/api';
import { useSpreadsheetStore } from '@/store/useSpreadsheetStore';
import { X, Plus, GripVertical } from 'lucide-react';

interface CreateSpreadsheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSpreadsheetModal({ open, onOpenChange }: CreateSpreadsheetModalProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [suggestedColumns, setSuggestedColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [indexColumn, setIndexColumn] = useState('');
  const [newColumn, setNewColumn] = useState('');
  
  const addSheet = useSpreadsheetStore(state => state.addSheet);

  const handleContinue = async () => {
    if (step === 1) {
      setLoading(true);
      try {
        const suggested = await apiService.getSuggestedColumns(description);
        setSuggestedColumns(suggested);
        setColumns(suggested);
        setStep(2);
      } catch (error) {
        console.error('Error getting suggested columns:', error);
      }
      setLoading(false);
    } else {
      addSheet(title, description, columns, indexColumn);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setColumns([]);
    setSuggestedColumns([]);
    setIndexColumn('');
    setNewColumn('');
    onOpenChange(false);
  };

  const addNewColumn = () => {
    if (newColumn && !columns.includes(newColumn)) {
      setColumns([...columns, newColumn]);
      setNewColumn('');
    }
  };

  const removeColumn = (column: string) => {
    setColumns(columns.filter(c => c !== column));
    if (indexColumn === column) {
      setIndexColumn('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-white">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {step === 1 ? 'Create New Research Spreadsheet' : 'Customize Your Columns'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Research Title</label>
              <Input
                placeholder="Enter research title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-gray-200 focus-visible:ring-gray-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Research Description</label>
              <Textarea
                placeholder="Enter research description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="border-gray-200 focus-visible:ring-gray-700 resize-none"
              />
            </div>

            <Button
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              onClick={handleContinue}
              disabled={!title || !description || loading}
            >
              {loading ? 'Loading...' : 'Continue'}
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              {columns.map((column) => (
                <div key={column} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md group">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <span className="flex-1 text-gray-900">{column}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeColumn(column)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="p-6 space-y-6 bg-gray-50">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new column..."
                  value={newColumn}
                  onChange={(e) => setNewColumn(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNewColumn()}
                  className="border-gray-200 focus-visible:ring-gray-700"
                />
                <Button 
                  onClick={addNewColumn}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Index Column</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-md focus:ring-gray-700 focus:ring-2 focus:ring-offset-2 outline-none"
                  value={indexColumn}
                  onChange={(e) => setIndexColumn(e.target.value)}
                >
                  <option value="">None</option>
                  {columns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                onClick={handleContinue}
                disabled={!indexColumn || columns.length === 0}
              >
                Create Spreadsheet
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
