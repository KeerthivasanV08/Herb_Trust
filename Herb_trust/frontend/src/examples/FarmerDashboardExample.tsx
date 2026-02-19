// Example: Display all batches in FarmerDashboard

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBatches } from '@/services/api';
import type { Batch } from '@/types/batch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';

export default function FarmerDashboard() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await getAllBatches();
        // Sort by created_at descending (newest first)
        const sorted = data.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setBatches(sorted);
      } catch (error) {
        console.error('Failed to fetch batches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const getStatusVariant = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'fraud suspected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Batches</h1>
          <p className="text-muted-foreground mt-1">
            View verification status of all your submissions
          </p>
        </div>
        <Button onClick={() => navigate('/farmer/submit')}>
          Submit New Batch
        </Button>
      </div>

      {batches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No batches submitted yet. Start by submitting your first harvest!
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <Card key={batch.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">Batch #{batch.id}</CardTitle>
                  <Badge variant={getStatusVariant(batch.compliance_status)}>
                    {batch.compliance_status || 'Processing'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Herb</p>
                    <p className="font-medium">{batch.herb_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Auth Score</p>
                    <p className="font-medium">
                      {batch.authenticity_score !== null
                        ? `${batch.authenticity_score.toFixed(1)}%`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Geo Valid</p>
                    <p className="font-medium">
                      {batch.geo_valid !== null ? (batch.geo_valid ? 'Yes' : 'No') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Potency</p>
                    <p className="font-medium">
                      {batch.potency_score !== null
                        ? `${batch.potency_score.toFixed(1)}%`
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(batch.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => navigate(`/farmer/batch/${batch.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
