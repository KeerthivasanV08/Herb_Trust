import { useState, useEffect } from 'react';
import { Package, Leaf, Search, Loader2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getAllBatches, downloadCertificate } from '@/services/api';
import type { Batch } from '@/types/batch';
import { useTranslation } from 'react-i18next';

export default function FarmerBatches() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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

  const handleCertificateDownload = async (batchId: number) => {
    try {
      setDownloadingId(batchId);
      const blob = await downloadCertificate(batchId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${batchId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download certificate:', error);
    } finally {
      setDownloadingId(null);
    }
  };

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
        <h1 className="text-2xl font-bold text-foreground">{t('farmer.batches.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('farmer.batches.subtitle')}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t('common.search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t('farmer.batches.status')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="approved">{t('compliance.approved')}</SelectItem>
            <SelectItem value="rejected">{t('compliance.rejected')}</SelectItem>
            <SelectItem value="fraud suspected">{t('compliance.fraudSuspected')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="card-elevated">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {t('farmer.batches.title')} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('farmer.batches.batchId')}</TableHead>
                <TableHead>{t('farmer.batches.herb')}</TableHead>
                <TableHead>{t('farmer.batches.quantity')}</TableHead>
                <TableHead>{t('farmer.batches.harvestDate')}</TableHead>
                <TableHead>{t('farmer.batches.region')}</TableHead>
                <TableHead>{t('farmer.batches.aiScore')}</TableHead>
                <TableHead>{t('farmer.batches.status')}</TableHead>
                <TableHead className="text-center">{t('common.certificate')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(batch => (
                <TableRow key={batch.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-primary">#{batch.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-primary/60" />
                      {batch.herb_type}
                    </div>
                  </TableCell>
                  <TableCell>{batch.quantity_kg} kg</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(batch.harvest_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-muted-foreground">{batch.region || '-'}</TableCell>
                  <TableCell>
                    {batch.authenticity_score !== null ? (
                      <span className={`font-semibold ${batch.authenticity_score >= 75 ? 'text-success' : batch.authenticity_score >= 40 ? 'text-warning' : 'text-destructive'}`}>
                        {batch.authenticity_score.toFixed(1)}%
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {batch.compliance_status?.toLowerCase() === 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCertificateDownload(batch.id)}
                        disabled={downloadingId === batch.id}
                        className="gap-2"
                      >
                        {downloadingId === batch.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {t('farmer.batches.downloadCertificate')}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(batch.compliance_status)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('farmer.batches.noBatches')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
