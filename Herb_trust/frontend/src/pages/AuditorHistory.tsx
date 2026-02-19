import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield, CheckCircle2, AlertTriangle, Leaf, Hash, Filter, Search, Loader2, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getAllBatches } from '@/services/api';
import type { Batch } from '@/types/batch';
import FraudWarning from '@/components/FraudWarning';

const herbTypes = ['Ashwagandha', 'Tulsi', 'Neem', 'Turmeric'];

export default function AuditorHistory() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [herbFilter, setHerbFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

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

  const regions = [...new Set(batches.map(b => b.region).filter(Boolean))];

  const handleDownloadCertificate = (batchId: number) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/batches/${batchId}/certificate/`;
    setDownloadingId(batchId);
    window.open(url, '_blank');
    setTimeout(() => setDownloadingId(null), 1000);
  };

  const filtered = batches.filter(b => {
    const matchSearch = b.herb_type.toLowerCase().includes(search.toLowerCase()) ||
      String(b.id).includes(search.toLowerCase()) || (b.farmer_name && b.farmer_name.toLowerCase().includes(search.toLowerCase()));
    const matchHerb = herbFilter === 'all' || b.herb_type === herbFilter;
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'compliant' && b.compliance_status === 'Approved') ||
      (statusFilter === 'non-compliant' && (b.compliance_status === 'Rejected' || b.compliance_status === 'Fraud Suspected')) ||
      (statusFilter === 'pending' && !b.compliance_status);
    const matchRegion = regionFilter === 'all' || b.region === regionFilter;
    return matchSearch && matchHerb && matchStatus && matchRegion;
  });

  const getComplianceBadge = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <Badge className="badge-approved">{t('compliance.compliant')}</Badge>;
      case 'rejected': case 'fraud suspected': return <Badge className="badge-blocked">{t('compliance.nonCompliant')}</Badge>;
      default: return <Badge className="badge-pending">{t('compliance.underReview')}</Badge>;
    }
  };

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
        <h1 className="text-2xl font-bold text-foreground">{t('auditor.history.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('auditor.history.subtitle')}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={`${t('common.search')} batches...`} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground"><Filter className="w-4 h-4" /></div>
        <Select value={herbFilter} onValueChange={setHerbFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Herb" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('auditor.history.allHerbs')}</SelectItem>
            {herbTypes.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('auditor.history.allStatuses')}</SelectItem>
            <SelectItem value="compliant">{t('compliance.compliant')}</SelectItem>
            <SelectItem value="non-compliant">{t('compliance.nonCompliant')}</SelectItem>
            <SelectItem value="pending">{t('compliance.pending')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Region" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('auditor.history.allRegions')}</SelectItem>
            {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="card-elevated">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t('auditor.history.completeBatchHistory')} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('auditor.history.batchId')}</TableHead>
                <TableHead>{t('auditor.history.herb')}</TableHead>
                <TableHead>{t('auditor.history.farmer')}</TableHead>
                <TableHead>{t('auditor.history.region')}</TableHead>
                <TableHead>{t('auditor.history.date')}</TableHead>
                <TableHead>{t('auditor.history.aiScore')}</TableHead>
                <TableHead>{t('auditor.history.ecoValid')}</TableHead>
                <TableHead>{t('auditor.history.compliance')}</TableHead>
                <TableHead>{t('auditor.history.blockchainHash')}</TableHead>
                <TableHead className="text-right">{t('manufacturer.incoming.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(batch => (
                <TableRow key={batch.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-primary">#{batch.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-primary/60" />{batch.herb_type}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{batch.farmer_name || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{batch.region || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(batch.harvest_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {batch.authenticity_score !== null ? (
                        <span className={`font-semibold ${batch.authenticity_score >= 75 ? 'text-success' : batch.authenticity_score >= 40 ? 'text-warning' : 'text-destructive'}`}>
                          {batch.authenticity_score.toFixed(1)}%
                        </span>
                      ) : '-'}
                      {batch.authenticity_score !== null && batch.authenticity_score < 60 && (
                        <div className="mt-1">
                          <FraudWarning authenticityScore={batch.authenticity_score} variant="compact" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {batch.geo_valid !== null ? (
                      batch.geo_valid ? <CheckCircle2 className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-destructive" />
                    ) : '-'}
                  </TableCell>
                  <TableCell>{getComplianceBadge(batch.compliance_status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">
                        {batch.blockchain_hash ? batch.blockchain_hash.slice(0, 16) + '...' : '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {batch.compliance_status === 'Approved' && (
                      <Button
                        size="sm"
                        onClick={() => handleDownloadCertificate(batch.id)}
                        disabled={downloadingId === batch.id}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg shadow-md"
                      >
                        {downloadingId === batch.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-1" />
                            {t('common.certificate')}
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">{t('auditor.history.noBatches')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
