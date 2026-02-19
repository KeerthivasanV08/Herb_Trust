import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Globe, CheckCircle2, XCircle, Clock, Loader2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface BatchGeoData {
  id: number;
  batch_id: string;
  latitude: number;
  longitude: number;
  region: string | null;
  compliance_status: string | null;
}

export default function AuditorComplianceMap() {
  const { t } = useTranslation();
  const [batches, setBatches] = useState<BatchGeoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complianceFilter, setComplianceFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
        const response = await axios.get<BatchGeoData[]>(`${baseUrl}/api/batches/geo_data/`, {
          withCredentials: true,
        });
        setBatches(response.data);
      } catch (err) {
        console.error('Failed to fetch geo data:', err);
        setError(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchGeoData();
  }, [t]);

  // Get marker color based on compliance status
  const getMarkerColor = (status: string | null): string => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '#22c55e'; // green
      case 'rejected':
      case 'fraud suspected':
        return '#ef4444'; // red
      default:
        return '#eab308'; // yellow
    }
  };

  // Create custom colored marker
  const createColoredIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });
  };

  // Get unique regions for filter
  const uniqueRegions = Array.from(new Set(batches.map(b => b.region).filter(Boolean))) as string[];

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const matchesCompliance = complianceFilter === 'all' || 
      batch.compliance_status?.toLowerCase() === complianceFilter.toLowerCase();
    const matchesRegion = regionFilter === 'all' || batch.region === regionFilter;
    return matchesCompliance && matchesRegion;
  });

  // Calculate statistics
  const stats = {
    total: batches.length,
    approved: batches.filter(b => b.compliance_status === 'Approved').length,
    rejected: batches.filter(b => b.compliance_status === 'Rejected' || b.compliance_status === 'Fraud Suspected').length,
    pending: batches.filter(b => !b.compliance_status || b.compliance_status === 'Pending').length,
  };

  const getComplianceBadge = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <Badge className="badge-approved">{t('compliance.approved')}</Badge>;
      case 'rejected':
      case 'fraud suspected':
        return <Badge className="badge-blocked">{t('compliance.rejected')}</Badge>;
      default:
        return <Badge className="badge-pending">{t('compliance.pending')}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <XCircle className="w-12 h-12 mx-auto text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate center of all markers
  const center: [number, number] = batches.length > 0
    ? [
        batches.reduce((sum, b) => sum + b.latitude, 0) / batches.length,
        batches.reduce((sum, b) => sum + b.longitude, 0) / batches.length
      ]
    : [20.5937, 78.9629]; // Center of India as default

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('auditor.complianceMap.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('auditor.complianceMap.subtitle')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-emerald-500 to-teal-600 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-white opacity-90 mb-2">{t('auditor.complianceMap.totalLocations')}</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <MapPin className="w-7 h-7 text-white opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-white opacity-90 mb-2">{t('compliance.approved')}</p>
                <p className="text-3xl font-bold text-white">{stats.approved}</p>
              </div>
              <CheckCircle2 className="w-7 h-7 text-white opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-500 to-rose-600 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-white opacity-90 mb-2">{t('compliance.rejected')}</p>
                <p className="text-3xl font-bold text-white">{stats.rejected}</p>
              </div>
              <XCircle className="w-7 h-7 text-white opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-500 to-yellow-600 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-white opacity-90 mb-2">{t('compliance.pending')}</p>
                <p className="text-3xl font-bold text-white">{stats.pending}</p>
              </div>
              <Clock className="w-7 h-7 text-white opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t('common.filters')}:</span>
            </div>

            <Select value={complianceFilter} onValueChange={setComplianceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('auditor.complianceMap.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="approved">{t('compliance.approved')}</SelectItem>
                <SelectItem value="rejected">{t('compliance.rejected')}</SelectItem>
                <SelectItem value="pending">{t('compliance.pending')}</SelectItem>
              </SelectContent>
            </Select>

            {uniqueRegions.length > 0 && (
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('auditor.complianceMap.filterByRegion')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {uniqueRegions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="ml-auto text-sm text-muted-foreground">
              {t('auditor.complianceMap.showing')} {filteredBatches.length} {t('auditor.complianceMap.of')} {batches.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="card-elevated overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t('auditor.complianceMap.harvestLocationMap')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: '600px', width: '100%' }}>
            <MapContainer
              center={center}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {filteredBatches.map((batch) => (
                <Marker
                  key={batch.id}
                  position={[batch.latitude, batch.longitude]}
                  icon={createColoredIcon(getMarkerColor(batch.compliance_status))}
                >
                  <Popup>
                    <div className="space-y-2 p-2">
                      <div>
                        <p className="font-bold text-base">{batch.batch_id}</p>
                        {batch.region && (
                          <p className="text-sm text-muted-foreground">{batch.region}</p>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{t('auditor.complianceMap.status')}:</span>
                          {getComplianceBadge(batch.compliance_status)}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          <p>{t('auditor.complianceMap.latitude')}: {batch.latitude.toFixed(4)}</p>
                          <p>{t('auditor.complianceMap.longitude')}: {batch.longitude.toFixed(4)}</p>
                        </div>
                      </div>

                      <a
                        href={`/verify/${batch.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-block mt-2"
                      >
                        {t('auditor.complianceMap.viewDetails')} →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('auditor.complianceMap.legend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm">{t('compliance.approved')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm">{t('compliance.rejected')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm">{t('compliance.pending')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
