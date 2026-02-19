import { useState } from 'react';
import { getAllBatches } from '@/services/api';
import type { Batch } from '@/types/batch';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function BatchList() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await getAllBatches();
        setBatches(data);
      } catch (err) {
        setError('Failed to fetch batches');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-12">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">All Batches</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map((batch) => (
          <Card key={batch.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Batch #{batch.id}</span>
                <Badge
                  variant={
                    batch.compliance_status === 'Approved'
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {batch.compliance_status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Herb:</span>{' '}
                  {batch.herb_type}
                </div>
                <div>
                  <span className="text-muted-foreground">Auth Score:</span>{' '}
                  {batch.authenticity_score?.toFixed(2)}%
                </div>
                <div>
                  <span className="text-muted-foreground">Potency:</span>{' '}
                  {batch.potency_score?.toFixed(2)}%
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
