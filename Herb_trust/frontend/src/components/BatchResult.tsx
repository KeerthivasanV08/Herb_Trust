import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Hash, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getBatchById } from '@/services/api';
import type { Batch, ApiError } from '@/types/batch';

interface BatchResultProps {
  batchId: number;
  onBack?: () => void;
}

export default function BatchResult({ batchId }: BatchResultProps) {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getBatchById(batchId);
        setBatch(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to fetch batch details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatch();
  }, [batchId]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading batch details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!batch) {
    return null;
  }

  const getComplianceColor = (status: string | null) => {
    if (!status) return 'bg-gray-500';
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'fraud suspected':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getComplianceIcon = (status: string | null) => {
    if (!status) return <AlertCircle className="w-5 h-5" />;
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'rejected':
      case 'fraud suspected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Batch #{batch.id}</CardTitle>
              <CardDescription className="mt-2">
                {batch.herb_type} - Submitted on {new Date(batch.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge
              className={`${getComplianceColor(batch.compliance_status)} text-white px-4 py-2`}
            >
              {batch.compliance_status || 'Processing'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Verification Results */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Results</CardTitle>
          <CardDescription>AI-powered authenticity and compliance checks</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          {/* Authenticity Score */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4" />
              <span>Authenticity Score</span>
            </div>
            <div className="text-3xl font-bold">
              {batch.authenticity_score !== null ? (
                `${batch.authenticity_score.toFixed(2)}%`
              ) : (
                <span className="text-lg text-muted-foreground">Processing...</span>
              )}
            </div>
            {batch.authenticity_score !== null && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    batch.authenticity_score >= 75 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(batch.authenticity_score, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Geo Validation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Geo Validation</span>
            </div>
            <div className="flex items-center gap-2">
              {batch.geo_valid !== null ? (
                <>
                  {batch.geo_valid ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500" />
                  )}
                  <span className="text-2xl font-bold">
                    {batch.geo_valid ? 'Valid' : 'Invalid'}
                  </span>
                </>
              ) : (
                <span className="text-lg text-muted-foreground">Processing...</span>
              )}
            </div>
          </div>

          {/* Potency Score */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Potency Score</span>
            </div>
            <div className="text-3xl font-bold">
              {batch.potency_score !== null ? (
                `${batch.potency_score.toFixed(2)}%`
              ) : (
                <span className="text-lg text-muted-foreground">Processing...</span>
              )}
            </div>
            {batch.potency_score !== null && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    batch.potency_score >= 60 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(batch.potency_score, 100)}%` }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Decision</CardTitle>
          <CardDescription>Final verification status based on all checks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {getComplianceIcon(batch.compliance_status)}
            <div>
              <div className="text-xl font-bold">
                {batch.compliance_status || 'Processing'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {batch.compliance_status === 'Approved' &&
                  'All verification checks passed successfully'}
                {batch.compliance_status === 'Rejected' && 'Verification checks failed'}
                {batch.compliance_status === 'Fraud Suspected' &&
                  'Potential authenticity issues detected'}
                {!batch.compliance_status && 'Running compliance checks...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Hash */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Hash</CardTitle>
          <CardDescription>Tamper-proof verification record</CardDescription>
        </CardHeader>
        <CardContent>
          {batch.blockchain_hash ? (
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm break-all">
              <Hash className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <code className="text-xs">{batch.blockchain_hash}</code>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating blockchain hash...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Details */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Details</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-muted-foreground">Herb Type</div>
            <div className="text-lg font-medium mt-1">{batch.herb_type}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Harvest Date</div>
            <div className="text-lg font-medium mt-1">
              {new Date(batch.harvest_date).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Location</div>
            <div className="text-lg font-medium mt-1">
              {batch.latitude.toFixed(6)}, {batch.longitude.toFixed(6)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Submitted</div>
            <div className="text-lg font-medium mt-1">
              {new Date(batch.created_at).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image */}
      {batch.image && (
        <Card>
          <CardHeader>
            <CardTitle>Herb Image</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={`http://127.0.0.1:8000${batch.image}`}
              alt={`${batch.herb_type} batch`}
              className="w-full max-w-2xl mx-auto rounded-lg"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
