
import { Button } from '@/components/ui/button';
import { PlusSquare, Loader2 } from 'lucide-react';

interface AutofillButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function AutofillButton({ onClick, isLoading }: AutofillButtonProps) {
  return (
    <div className="fixed bottom-4 right-4">
      <Button 
        onClick={onClick}
        disabled={isLoading}
        className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <PlusSquare className="h-4 w-4 mr-1" />
        )}
        {isLoading ? 'Autofilling...' : 'AI Autofill'}
      </Button>
    </div>
  );
}
