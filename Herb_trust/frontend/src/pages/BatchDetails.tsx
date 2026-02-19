import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import BatchResult from '@/components/BatchResult';

export default function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Batch ID not found</h2>
          <Button
            variant="outline"
            onClick={() => navigate('/farmer/batches')}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
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

      <BatchResult batchId={Number(id)} />
    </div>
  );
}
