import { useState, useEffect } from 'react';
import {
  Package, CheckCircle2, XCircle, Leaf, ChevronRight, Beaker, ShieldCheck, Clock, LineChart as LineChartIcon, Search, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getAllBatches } from '@/services/api';
import { useTranslation } from 'react-i18next';
import type { Batch } from '@/types/batch';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import FraudWarning from '@/components/FraudWarning';

export default function ManufacturerIncoming() {
  const { t } = useTranslation();
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await getAllBatches();
        setBatches(data);
      } catch (error) {
        console.error('Failed to fetch batches:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const filtered = batches.filter(b => {
    const matchSearch = b.herb_type.toLowerCase().includes(search.toLowerCase()) || String(b.id).includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.compliance_status?.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <Badge className="badge-approved">{t('compliance.approved')}</Badge>;
      case 'rejected': case 'fraud suspected': return <Badge className="badge-blocked">{t('compliance.rejected')}</Badge>;
      default: return <Badge className="badge-pending">{t('compliance.pending')}</Badge>;
    }
  };

  const getScoreColor = (score: number | null) => !score ? 'text-muted-foreground' : score >= 75 ? 'text-success' : score >= 40 ? 'text-warning' : 'text-destructive';
  const getProgressColor = (score: number | null) => !score ? 'bg-muted' : score >= 75 ? 'bg-success' : score >= 40 ? 'bg-warning' : 'bg-destructive';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('manufacturer.incoming.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('manufacturer.incoming.subtitle')}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t('common.search') + '...'} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t('manufacturer.incoming.status')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')} {t('manufacturer.incoming.status')}</SelectItem>
            <SelectItem value="pending">{t('compliance.pending')}</SelectItem>
            <SelectItem value="verified">{t('compliance.verified')}</SelectItem>
            <SelectItem value="approved">{t('compliance.approved')}</SelectItem>
            <SelectItem value="blocked">{t('compliance.rejected')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="card-elevated">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {t('manufacturer.incoming.title')} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('manufacturer.incoming.batchId')}</TableHead>
                <TableHead>{t('manufacturer.incoming.herb')}</TableHead>
                <TableHead>{t('manufacturer.incoming.farmer')}</TableHead>
                <TableHead>{t('manufacturer.incoming.aiScore')}</TableHead>
                <TableHead>{t('manufacturer.incoming.potency')}</TableHead>
                <TableHead>{t('manufacturer.incoming.status')}</TableHead>
                <TableHead className="text-right">{t('manufacturer.incoming.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(batch => (
                <TableRow key={batch.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedBatch(batch)}>
                  <TableCell className="font-mono text-primary">{batch.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-primary/60" />{batch.herb_type}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">-</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {batch.authenticity_score !== null ? (
                        <span className={`font-semibold ${getScoreColor(batch.authenticity_score)}`}>{batch.authenticity_score.toFixed(1)}%</span>
                      ) : ('-')}
                      {batch.authenticity_score !== null && batch.authenticity_score < 60 && (
                        <div className="mt-1">
                          <FraudWarning authenticityScore={batch.authenticity_score} variant="compact" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${getProgressColor(batch.potency_score)} transition-all`} style={{ width: `${batch.potency_score || 0}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground">{batch.potency_score?.toFixed(1) || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(batch.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-primary">{t('common.view')} <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('manufacturer.incoming.noBatches')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
        <DialogContent className="max-w-3xl">
          {selectedBatch && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Leaf className="w-5 h-5 text-primary" /></div>
                  <div>
                    <span className="text-xl">{selectedBatch.herb_type}</span>
                    <span className="ml-3 font-mono text-sm text-muted-foreground">{selectedBatch.id}</span>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/40 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-2"><Beaker className="w-4 h-4" />{t('manufacturer.incoming.aiScore')}</span>
                      <span className={`text-2xl font-bold ${getScoreColor(selectedBatch.authenticity_score)}`}>
                        {selectedBatch.authenticity_score !== null ? selectedBatch.authenticity_score.toFixed(1) : 0}%
                      </span>
                    </div>
                    <Progress value={selectedBatch.authenticity_score || 0} className="h-3" />
                    {selectedBatch.authenticity_score !== null && selectedBatch.authenticity_score < 60 && (
                      <div className="mt-3">
                        <FraudWarning authenticityScore={selectedBatch.authenticity_score} />
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2"><ShieldCheck className="w-4 h-4" />{t('verify.geoValidation')}</span>
                    {selectedBatch.geo_valid ? (
                      <span className="flex items-center gap-2 text-success"><CheckCircle2 className="w-5 h-5" />{t('verify.valid')}</span>
                    ) : (
                      <span className="flex items-center gap-2 text-destructive"><XCircle className="w-5 h-5" />{t('verify.invalid')}</span>
                    )}
                  </div>
                  <div className={`p-6 rounded-lg text-center ${
                    selectedBatch.compliance_status?.toLowerCase() === 'approved' ? 'bg-success/10 border-2 border-success/20' :
                    selectedBatch.compliance_status?.toLowerCase() === 'rejected' || selectedBatch.compliance_status?.toLowerCase() === 'fraud suspected' ? 'bg-destructive/10 border-2 border-destructive/20' :
                    'bg-warning/10 border-2 border-warning/20'
                  }`}>
                    <div className={`mb-2 ${
                      selectedBatch.compliance_status?.toLowerCase() === 'approved' ? 'text-success' :
                      selectedBatch.compliance_status?.toLowerCase() === 'rejected' || selectedBatch.compliance_status?.toLowerCase() === 'fraud suspected' ? 'text-destructive' : 'text-warning'
                    }`}>
                      {selectedBatch.compliance_status?.toLowerCase() === 'approved' ? <CheckCircle2 className="w-12 h-12 mx-auto" /> :
                       selectedBatch.compliance_status?.toLowerCase() === 'rejected' || selectedBatch.compliance_status?.toLowerCase() === 'fraud suspected' ? <XCircle className="w-12 h-12 mx-auto" /> :
                       <Clock className="w-12 h-12 mx-auto" />}
                    </div>
                    <p className="text-lg font-semibold capitalize">{selectedBatch.compliance_status || 'Pending'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('verify.complianceStatus')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/40 border border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <LineChartIcon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{t('manufacturer.incoming.potency')}</span>
                      <span className="ml-auto text-lg font-bold text-primary">
                        {selectedBatch.potency_score !== null ? selectedBatch.potency_score.toFixed(1) : 0}%
                      </span>
                    </div>
                    <Progress value={selectedBatch.potency_score || 0} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: t('manufacturer.incoming.batchId'), value: `#${selectedBatch.id}` },
                      { label: t('manufacturer.incoming.herb'), value: selectedBatch.herb_type },
                      { label: t('farmer.batches.harvestDate'), value: new Date(selectedBatch.harvest_date).toLocaleDateString() },
                      { label: 'Blockchain', value: selectedBatch.blockchain_hash ? 'Verified' : 'Pending' },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-lg bg-muted/40">
                        <p className="text-muted-foreground">{item.label}</p>
                        <p className="font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {selectedBatch.compliance_status?.toLowerCase() !== 'rejected' && selectedBatch.compliance_status?.toLowerCase() !== 'fraud suspected' && (
                <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                  <Button variant="outline" className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => setSelectedBatch(null)}>
                    <XCircle className="w-4 h-4 mr-2" />{t('compliance.rejected')}
                  </Button>
                  <Button className="flex-1 bg-gradient-primary" onClick={() => setSelectedBatch(null)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />{t('compliance.approved')}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
