import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BatchForm from '@/components/BatchForm';
import BatchResult from '@/components/BatchResult';
import { Button } from '@/components/ui/button';

export default function BatchDemo() {
  const [submittedBatchId, setSubmittedBatchId] = useState<number | null>(null);

  const handleBatchSuccess = (batchId: number) => {
    setSubmittedBatchId(batchId);
  };

  const handleBackToForm = () => {
    setSubmittedBatchId(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Herb Verification System
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-Powered Batch Verification with Blockchain Hash
          </p>
        </div>

        {/* Content */}
        {submittedBatchId ? (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={handleBackToForm}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Submit Another Batch
            </Button>
            <BatchResult batchId={submittedBatchId} />
          </div>
        ) : (
          <BatchForm onSuccess={handleBatchSuccess} />
        )}
      </div>
    </div>
  );
}
