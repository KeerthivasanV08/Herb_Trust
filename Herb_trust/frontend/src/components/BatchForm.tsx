import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createBatch } from '@/services/api';
import type { CreateBatchPayload, ApiError } from '@/types/batch';

interface BatchFormProps {
  onSuccess?: (batchId: number) => void;
}

const HERB_TYPES = ['Ashwagandha', 'Tulsi'];

export default function BatchForm({ onSuccess }: BatchFormProps) {
  const [formData, setFormData] = useState({
    herb_type: '',
    harvest_date: '',
    latitude: '',
    longitude: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
        },
        (error) => {
          setError(`Location error: ${error.message}`);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.herb_type) {
      setError('Please select an herb type');
      return false;
    }
    if (!formData.harvest_date) {
      setError('Please select a harvest date');
      return false;
    }
    if (!formData.latitude || !formData.longitude) {
      setError('Please provide location coordinates');
      return false;
    }
    if (!imageFile) {
      setError('Please upload an image');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload: CreateBatchPayload = {
        herb_type: formData.herb_type,
        harvest_date: formData.harvest_date,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        image: imageFile!,
      };

      const result = await createBatch(payload);
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        herb_type: '',
        harvest_date: '',
        latitude: '',
        longitude: '',
      });
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent component
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(result.id);
        }, 1500);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to submit batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit New Batch</CardTitle>
        <CardDescription>
          Submit your herb harvest for AI verification and compliance checking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Herb Type */}
          <div className="space-y-2">
            <Label htmlFor="herb_type">Herb Type *</Label>
            <Select
              value={formData.herb_type}
              onValueChange={(value) => handleInputChange('herb_type', value)}
            >
              <SelectTrigger id="herb_type">
                <SelectValue placeholder="Select herb type" />
              </SelectTrigger>
              <SelectContent>
                {HERB_TYPES.map((herb) => (
                  <SelectItem key={herb} value={herb}>
                    {herb}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Harvest Date */}
          <div className="space-y-2">
            <Label htmlFor="harvest_date">Harvest Date *</Label>
            <Input
              id="harvest_date"
              type="date"
              value={formData.harvest_date}
              onChange={(e) => handleInputChange('harvest_date', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Location Coordinates *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
              >
                Get Current Location
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude" className="text-sm text-muted-foreground">
                  Latitude
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 23.2599"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-sm text-muted-foreground">
                  Longitude
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 77.4126"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Herb Image *</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {imageFile ? 'Change Image' : 'Upload Image'}
              </Button>
              <input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {imagePreview && (
              <div className="mt-4 rounded-lg overflow-hidden border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Batch submitted successfully! Verification in progress...
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Batch'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
