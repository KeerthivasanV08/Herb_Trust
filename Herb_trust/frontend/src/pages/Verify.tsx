import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle, Leaf, Hash, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/LanguageSelector';
import { getBatchById } from '@/services/api';
import type { Batch } from '@/types/batch';

export default function Verify() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatch = async () => {
      if (!id) {
        setError('Invalid batch ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getBatchById(parseInt(id));
        setBatch(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch batch');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatch();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('verify.verifying')}</p>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-8">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('verify.verificationFailed')}</h2>
              <p className="text-muted-foreground mb-6">{error || t('verify.batchNotFound')}</p>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('verify.backToHome')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isApproved = batch.compliance_status === 'Approved';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
          {/* Language Selector */}
          <div className="flex justify-end mb-2">
            <LanguageSelector />
          </div>
          
          <div className="text-center">
            {isApproved ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-3" />
                <CardTitle className="text-3xl text-success">{t('verify.verified')}</CardTitle>
                <p className="text-muted-foreground mt-2">{t('verify.approvedMessage')}</p>
              </>
            ) : (
              <>
                <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-3" />
                <CardTitle className="text-3xl text-warning">{t('verify.notVerified')}</CardTitle>
                <p className="text-muted-foreground mt-2">{t('verify.notApprovedMessage')}</p>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-8 space-y-6">
          {/* Batch Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{t('verify.batchInformation')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <p className="text-sm text-muted-foreground font-medium">{t('farmer.batches.batchId')}</p>
                <p className="text-lg font-mono font-bold text-primary mt-1">#{batch.id}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  {t('verify.cropName')}
                </p>
                <p className="text-lg font-semibold text-foreground mt-1">{batch.herb_type}</p>
              </div>
            </div>
          </div>

          {/* Verification Scores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{t('verify.verificationScores')}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Authenticity Score */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
                <p className="text-sm text-muted-foreground font-medium">{t('verify.authenticityScore')}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {batch.authenticity_score !== null ? `${batch.authenticity_score.toFixed(1)}%` : 'N/A'}
                </p>
                <div className="mt-3 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${Math.min(batch.authenticity_score || 0, 100)}%` }}
                  />
                </div>
              </div>

              {/* Potency Score */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200">
                <p className="text-sm text-muted-foreground font-medium">{t('verify.potencyScore')}</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {batch.potency_score !== null ? `${batch.potency_score.toFixed(1)}%` : 'N/A'}
                </p>
                <div className="mt-3 h-2 bg-green-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600"
                    style={{ width: `${Math.min(batch.potency_score || 0, 100)}%` }}
                  />
                </div>
              </div>

              {/* Geo Validation */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
                <p className="text-sm text-muted-foreground font-medium">{t('verify.geoValidation')}</p>
                <div className="mt-2 flex items-center gap-2">
                  {batch.geo_valid ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-success" />
                      <span className="text-lg font-bold text-success">{t('verify.valid')}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-warning" />
                      <span className="text-lg font-bold text-warning">{t('verify.invalid')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="p-4 rounded-lg bg-muted/40 border border-border">
            <p className="text-sm text-muted-foreground font-medium">{t('verify.complianceStatus')}</p>
            <div className="mt-2 flex items-center gap-2">
              {batch.compliance_status === 'Approved' ? (
                <Badge className="bg-success/10 text-success border border-success/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {t('compliance.approved')}
                </Badge>
              ) : (
                <Badge className="bg-destructive/10 text-destructive border border-destructive/30">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {batch.compliance_status === 'Rejected' ? t('compliance.rejected') : batch.compliance_status || t('verify.notAvailable')}
                </Badge>
              )}
            </div>
          </div>

          {/* Blockchain Hash */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Hash className="w-5 h-5" />
              {t('verify.blockchainHash')}
            </h3>
            <div className="p-4 rounded-lg bg-muted/40 border border-border overflow-auto">
              <p className="font-mono text-xs text-muted-foreground break-all">
                {batch.blockchain_hash || t('verify.notAvailable')}
              </p>
            </div>
          </div>

          {/* Generated Timestamp */}
          <div className="p-4 rounded-lg bg-muted/40 border border-border text-center">
            <p className="text-sm text-muted-foreground">{t('verify.verifiedOn')}</p>
            <p className="text-foreground font-medium mt-1">
              {new Date(batch.created_at).toLocaleString()}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              {t('verify.disclaimer')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
