
import { useSpreadsheetStore } from '@/store/useSpreadsheetStore';
import { Button } from '@/components/ui/button';
import { Plus, FileSpreadsheet } from 'lucide-react';

interface SpreadsheetTabsProps {
  onNewTab: () => void;
}

export function SpreadsheetTabs({ onNewTab }: SpreadsheetTabsProps) {
  const { sheets, activeSheetId, setActiveSheet } = useSpreadsheetStore();

  return (
    <div className="flex items-center gap-2 border-b">
      {sheets.map((sheet) => (
        <button
          key={sheet.id}
          onClick={() => setActiveSheet(sheet.id)}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeSheetId === sheet.id
              ? 'bg-background border-x border-t border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          {sheet.title}
        </button>
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onNewTab}
        className="ml-2"
      >
        <Plus className="h-4 w-4" />
        New Sheet
      </Button>
    </div>
  );
}
