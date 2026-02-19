// Example: Create a batch details page

import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import BatchResult from '@/components/BatchResult';

export default function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return <div>Batch ID not found</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up p-6">
      <Button
        variant="outline"
        onClick={() => navigate('/farmer/batches')}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Batches
      </Button>

      {/* Display full verification results */}
      <BatchResult batchId={Number(id)} />
    </div>
  );
}
