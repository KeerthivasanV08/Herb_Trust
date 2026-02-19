// Example: Replace FarmerSubmit.tsx with real API integration

import { useNavigate } from 'react-router-dom';
import BatchForm from '@/components/BatchForm';

export default function FarmerSubmit() {
  const navigate = useNavigate();

  const handleBatchSubmitted = (batchId: number) => {
    // Navigate to results page or dashboard
    navigate(`/farmer/batch/${batchId}`);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submit New Harvest</h1>
        <p className="text-muted-foreground mt-1">
          Capture and submit your herb harvest data for verification.
        </p>
      </div>

      {/* Replace all the mock form logic with this single component */}
      <BatchForm onSuccess={handleBatchSubmitted} />
    </div>
  );
}
