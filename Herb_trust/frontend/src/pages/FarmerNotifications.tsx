import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { getAllBatches } from '@/services/api';
import type { Batch } from '@/types/batch';

export default function FarmerNotifications() {
  const { t } = useTranslation();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await getAllBatches();
        setBatches(data);
      } catch (err) {
        setError(t('common.error'));
        console.error('Error fetching batches:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, [t]);

  const getStatusBadge = (batch: Batch) => {
    const status = batch.compliance_status?.toLowerCase();
    if (status === 'approved') {
      return {
        icon: CheckCircle2,
        label: t('notifications.status.approved'),
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
      };
    }
    if (status === 'rejected' || status === 'fraud suspected') {
      return {
        icon: AlertCircle,
        label: t('notifications.status.rejected'),
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
      };
    }
    if (batch.ai_verified_at) {
      return {
        icon: Zap,
        label: t('notifications.status.aiAnalyzed'),
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
      };
    }
    return {
      icon: Clock,
      label: t('notifications.status.submitted'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    };
  };

  const renderTimeline = (batch: Batch) => {
    const timeline = [
      {
        stage: t('notifications.stages.submitted'),
        completed: true,
        date: batch.created_at,
        icon: '●',
        showScore: false,
      },
      {
        stage: t('notifications.stages.aiVerified'),
        completed: !!batch.ai_verified_at,
        date: batch.ai_verified_at,
        icon: batch.ai_verified_at ? '●' : '○',
        showScore: !!batch.ai_verified_at,
        score: batch.authenticity_score,
      },
      {
        stage: t('notifications.stages.auditorApproved'),
        completed: !!batch.auditor_approved_at,
        date: batch.auditor_approved_at,
        icon: batch.auditor_approved_at ? '●' : '○',
        showScore: false,
      },
      {
        stage: t('notifications.stages.certified'),
        completed: batch.compliance_status === 'Approved',
        date: batch.certificate_generated_at,
        icon: batch.compliance_status === 'Approved' ? '●' : '○',
        showScore: false,
      },
    ];

    return (
      <div className="space-y-2">
        {timeline.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div
              className={`text-lg font-bold ${
                item.completed ? 'text-green-500' : 'text-slate-400'
              }`}
            >
              {item.icon}
            </div>
            <div className="flex-1 pt-1">
              <p
                className={`font-medium ${
                  item.completed ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.stage}
              </p>
              {item.date && (
                <p className="text-xs text-muted-foreground">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}
              {item.showScore && item.score !== null && (
                <p className="text-xs font-semibold text-emerald-600 mt-1">
                  {t('notifications.authenticitySCore')}: {item.score.toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t('notifications.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('notifications.subtitle')}
        </p>
      </div>

      {batches.length === 0 ? (
        <Card className="card-botanical">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {t('notifications.noNotifications')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {batches.map((batch) => {
            const statusBadge = getStatusBadge(batch);
            const StatusIcon = statusBadge.icon;

            return (
              <Card key={batch.id} className="card-botanical overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 border-b border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="text-primary">#{batch.id}</span>
                        <span>{batch.herb_type}</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('farmer.batches.harvestDate')}:{' '}
                        {new Date(batch.harvest_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${statusBadge.bgColor}`}
                    >
                      <StatusIcon className={`w-5 h-5 ${statusBadge.color}`} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-3">
                        {t('notifications.timeline')}
                      </p>
                      {renderTimeline(batch)}
                    </div>

                    {batch.compliance_status === 'Rejected' ||
                    batch.compliance_status === 'Fraud Suspected' ? (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-xs font-medium text-red-600 mb-1">
                          {t('notifications.rejectionReason')}:
                        </p>
                        <p className="text-sm text-red-600 opacity-75">
                          {batch.compliance_status}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
