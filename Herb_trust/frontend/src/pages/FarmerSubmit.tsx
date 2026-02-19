import { useState, useRef } from 'react';
import { Upload, Camera, MapPin, Leaf, CheckCircle2, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Real herb types from Django backend HERB_CHOICES
const herbTypes = ['Ashwagandha', 'Tulsi', 'Neem', 'Turmeric'];

export default function FarmerSubmit() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedHerb, setSelectedHerb] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: t('farmer.submit.uploadImage'), description: t('farmer.submit.uploadImage') },
    { id: 2, title: t('farmer.submit.location'), description: t('farmer.submit.location') },
    { id: 3, title: t('farmer.submit.herbType'), description: t('farmer.submit.herbType') },
    { id: 4, title: t('common.submit'), description: t('common.submit') },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => { setImagePreview(reader.result as string); setCurrentStep(2); };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocation({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }); setCurrentStep(3); },
        () => { setLocation({ lat: '23.2599', lng: '77.4126' }); setCurrentStep(3); }
      );
    } else {
      setLocation({ lat: '23.2599', lng: '77.4126' }); setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setCurrentStep(1); setImagePreview(null); setSelectedHerb(''); setQuantity('');
    setLocation({ lat: '', lng: '' }); setIsSubmitted(false);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('farmer.submit.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('farmer.submit.subtitle')}</p>
      </div>

      <Card className="card-elevated">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            {t('farmer.submit.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isSubmitted && step.id === 4 ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                  </div>
                  <p className="text-xs mt-2 text-center hidden md:block text-muted-foreground">{step.title}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 lg:w-24 h-0.5 mx-2 transition-colors ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {!isSubmitted ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>{t('farmer.submit.uploadImage')}</Label>
                <div onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-video rounded-lg border-2 border-dashed transition-all cursor-pointer flex items-center justify-center ${
                    imagePreview ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Herb preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center p-6">
                      <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">{t('farmer.submit.dragDrop')}</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="flex-1">
                    <Upload className="w-4 h-4 mr-2" />{t('common.upload')}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />{t('common.upload')}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('farmer.submit.location')}</Label>
                  <div className="flex gap-2">
                    <Input placeholder={t('farmer.submit.latitude')} value={location.lat} onChange={e => setLocation({...location, lat: e.target.value})} />
                    <Input placeholder={t('farmer.submit.longitude')} value={location.lng} onChange={e => setLocation({...location, lng: e.target.value})} />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleGetLocation} className="w-full">
                    <MapPin className="w-4 h-4 mr-2" />{t('farmer.submit.location')}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>{t('farmer.submit.herbType')}</Label>
                  <Select value={selectedHerb} onValueChange={v => { setSelectedHerb(v); setCurrentStep(Math.max(currentStep, 3)); }}>
                    <SelectTrigger><SelectValue placeholder={t('farmer.submit.selectHerb')} /></SelectTrigger>
                    <SelectContent>
                      {herbTypes.map(herb => <SelectItem key={herb} value={herb}>{herb}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('farmer.batches.quantity')}</Label>
                  <Input type="number" placeholder={t('farmer.batches.quantity')} value={quantity}
                    onChange={e => { setQuantity(e.target.value); if (e.target.value) setCurrentStep(4); }} />
                </div>
                <Button onClick={handleSubmit} disabled={!imagePreview || !selectedHerb || !quantity || isSubmitting}
                  className="w-full bg-gradient-primary hover:opacity-90 mt-4">
                  {isSubmitting ? t('farmer.submit.submitting') : <><span>{t('farmer.submit.submitBatch')}</span><ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 animate-scale-in">
              <div className="w-20 h-20 mx-auto rounded-full bg-success/15 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('common.success')}!</h3>
              <p className="text-muted-foreground mb-6">
                {t('farmer.submit.subtitle')}<br />
                {t('farmer.batches.batchId')}: <span className="text-primary font-mono">BTH-{Date.now().toString().slice(-6)}</span>
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={resetForm}>{t('common.submit')}</Button>
                <Button className="bg-gradient-primary" onClick={() => navigate('/farmer/batches')}>{t('nav.batches')}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
