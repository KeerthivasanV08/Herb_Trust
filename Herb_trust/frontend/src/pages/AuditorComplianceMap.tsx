import { MapPin, Globe, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockBatches } from '@/data/mockData';

export default function AuditorComplianceMap() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compliance Map</h1>
        <p className="text-muted-foreground mt-1">Geographic overview of harvest locations and compliance status.</p>
      </div>

      <Card className="card-elevated">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Harvest Location Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-80 bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Globe className="w-16 h-16 mx-auto text-primary/20 mb-4" />
                <p className="text-muted-foreground font-medium">Interactive Geo-Map</p>
                <p className="text-xs text-muted-foreground mt-1">Showing harvest locations across regions</p>
              </div>
            </div>
            {mockBatches.map((batch, index) => (
              <div
                key={batch.id}
                className={`absolute w-4 h-4 rounded-full cursor-pointer border-2 border-white shadow-md ${
                  batch.complianceStatus === 'approved' ? 'bg-success' :
                  batch.complianceStatus === 'blocked' ? 'bg-destructive' : 'bg-warning'
                }`}
                style={{
                  left: `${15 + (index * 13) % 70}%`,
                  top: `${20 + (index * 11) % 55}%`,
                }}
                title={`${batch.herbName} - ${batch.location.region}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location details */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockBatches.map(batch => (
          <Card key={batch.id} className="card-botanical hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-foreground">{batch.herbName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{batch.id}</p>
                </div>
                {batch.complianceStatus === 'approved' ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : batch.complianceStatus === 'blocked' ? (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                ) : (
                  <Badge className="badge-pending text-xs">Pending</Badge>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{batch.location.region}</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {batch.location.lat.toFixed(4)}, {batch.location.lng.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">Farmer: {batch.farmerName}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
