import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FraudWarningProps {
  authenticityScore: number | null;
  variant?: 'default' | 'compact';
}

export default function FraudWarning({ authenticityScore, variant = 'default' }: FraudWarningProps) {
  const { t } = useTranslation();

  // Don't show if score is null or >= 60
  if (authenticityScore === null || authenticityScore >= 60) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/30 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span className="text-xs font-semibold text-red-700">{t('fraudWarning.title')}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{t('fraudWarning.tooltip')}</p>
            <p className="text-xs font-semibold mt-1">
              {t('fraudWarning.authenticityScore')}: {authenticityScore.toFixed(1)}%
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Alert className="bg-red-50 border-red-200 border-2 shadow-lg animate-pulse-subtle">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1">
          <AlertDescription className="text-red-900">
            <div className="space-y-1">
              <p className="font-bold text-base flex items-center gap-2">
                🔴 {t('fraudWarning.title')}
              </p>
              <p className="text-sm font-medium">
                {t('fraudWarning.authenticityScore')}: <span className="text-red-700 font-bold">{authenticityScore.toFixed(1)}%</span>
              </p>
              <p className="text-xs text-red-700 italic mt-2">
                {t('fraudWarning.tooltip')}
              </p>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
