import { RotateCw } from 'lucide-react';
import { Button } from './button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="font-display font-bold text-primary">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RotateCw />
          Reintentar
        </Button>
      )}
    </div>
  );
}
