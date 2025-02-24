
import { useState, useEffect } from 'react';
import { useSpreadsheetStore } from '@/store/useSpreadsheetStore';
import { CreateSpreadsheetModal } from '@/components/CreateSpreadsheetModal';
import { SpreadsheetTabs } from '@/components/SpreadsheetTabs';
import { SpreadsheetTable } from '@/components/SpreadsheetTable';
import { apiService } from '@/services/api';

const Index = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { sheets, activeSheetId, setSheets, isLoading } = useSpreadsheetStore();
  
  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const response = await apiService.getSheets();
        setSheets(response.map(item => item.sheet));
      } catch (error) {
        console.error('Failed to fetch sheets:', error);
        setSheets([]);
      }
    };

    fetchSheets();
  }, [setSheets]);

  const activeSheet = sheets.find(sheet => sheet.id === activeSheetId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Loading your spreadsheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Research Spreadsheets</h1>
        
        <SpreadsheetTabs
          onNewTab={() => setIsCreateModalOpen(true)}
        />
        
        {activeSheet && (
          <SpreadsheetTable sheet={activeSheet} />
        )}

        <CreateSpreadsheetModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </div>
    </div>
  );
};

export default Index;
