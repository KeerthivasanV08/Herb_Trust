import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield, CheckCircle2, AlertTriangle, Globe, FileSearch, Leaf, Search, Loader2, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { getAllBatches } from '@/services/api';
import type { Batch } from '@/types/batch';
import FraudWarning from '@/components/FraudWarning';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS_STATUS = ['hsl(142, 76%, 36%)', 'hsl(0, 72%, 50%)'];
const REGION_COLORS = ['hsl(152, 45%, 38%)', 'hsl(38, 92%, 50%)', 'hsl(200, 70%, 50%)', 'hsl(280, 60%, 50%)', 'hsl(340, 70%, 50%)', 'hsl(60, 70%, 45%)'];

export default function AuditorDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
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

  const handleDownloadCertificate = (batchId: number) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/batches/${batchId}/certificate/`;
    setDownloadingId(batchId);
    window.open(url, '_blank');
    setTimeout(() => setDownloadingId(null), 1000);
  };

  const stats = {
    totalAudited: batches.length,
    compliant: batches.filter(b => b.compliance_status === 'Approved').length,
    nonCompliant: batches.filter(b => b.compliance_status === 'Rejected' || b.compliance_status === 'Fraud Suspected').length,
    flaggedForReview: batches.filter(b => b.compliance_status === 'Fraud Suspected').length,
  };

  const recentBatches = batches.slice(0, 10);
  const filteredBatches = recentBatches.filter(b =>
    b.herb_type.toLowerCase().includes(search.toLowerCase()) ||
    String(b.id).includes(search.toLowerCase()) ||
    (b.compliance_status && b.compliance_status.toLowerCase().includes(search.toLowerCase()))
  );

  const complianceData = [
    { name: 'Compliant', value: stats.compliant },
    { name: 'Non-Compliant', value: stats.nonCompliant },
  ];

  const regionCounts: Record<string, number> = {};
  batches.forEach(b => { 
    const region = b.region || 'Unknown';
    regionCounts[region] = (regionCounts[region] || 0) + 1; 
  });
  const regionData = Object.entries(regionCounts).map(([name, value]) => ({ name, value }));

  const herbCompliance: Record<string, { compliant: number; total: number }> = {};
  batches.forEach(b => {
    if (!herbCompliance[b.herb_type]) herbCompliance[b.herb_type] = { compliant: 0, total: 0 };
    herbCompliance[b.herb_type].total++;
    if (b.compliance_status === 'Approved') herbCompliance[b.herb_type].compliant++;
  });
  const herbComplianceData = Object.entries(herbCompliance).map(([name, d]) => ({
    name, rate: d.total > 0 ? Math.round((d.compliant / d.total) * 100) : 0,
  }));

  // Calculate 7-day compliance trend from real data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const complianceTrend = last7Days.map(date => {
    const dayBatches = batches.filter(b => b.created_at.startsWith(date));
    return {
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      compliant: dayBatches.filter(b => b.compliance_status === 'Approved').length,
      nonCompliant: dayBatches.filter(b => b.compliance_status === 'Rejected' || b.compliance_status === 'Fraud Suspected').length,
    };
  });

  const getComplianceBadge = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <Badge className="badge-approved">{t('compliance.compliant')}</Badge>;
      case 'rejected': case 'fraud suspected': return <Badge className="badge-blocked">{t('compliance.nonCompliant')}</Badge>;
      default: return <Badge className="badge-pending">{t('compliance.underReview')}</Badge>;
    }
  };

  const statCards = [
    { label: t('auditor.dashboard.totalTracked'), value: stats.totalAudited, icon: FileSearch, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', textColor: 'text-white', iconColor: 'text-white' },
    { label: t('auditor.dashboard.compliant'), value: stats.compliant, icon: CheckCircle2, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', textColor: 'text-white', iconColor: 'text-white' },
    { label: t('auditor.dashboard.nonCompliant'), value: stats.nonCompliant, icon: AlertTriangle, gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', textColor: 'text-white', iconColor: 'text-white' },
    { label: t('auditor.dashboard.regions'), value: Object.keys(regionCounts).length, icon: Globe, gradient: 'bg-gradient-to-br from-purple-500 to-violet-600', textColor: 'text-white', iconColor: 'text-white' },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('auditor.dashboard.welcome')}, <span className="text-gradient-primary">{user?.name}</span>
          </h1>
          <p className="text-muted-foreground mt-1">{t('auditor.dashboard.subtitle')}</p>
        </div>
        <Badge variant="outline" className="w-fit px-4 py-2 border-primary/30 text-primary">
          <Eye className="w-4 h-4 mr-2" />{t('auditor.dashboard.readOnlyAccess')}
        </Badge>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={`${t('common.search')} batches...`} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Card key={s.label} className={`border-0 ${s.gradient} overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${s.textColor} opacity-90 uppercase tracking-wider mb-2`}>{s.label}</p>
                  <p className={`text-3xl font-bold ${s.textColor}`}>{s.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:rotate-6`}>
                  <s.icon className={`w-7 h-7 ${s.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Batches Table */}
      <Card className="card-elevated">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t('auditor.dashboard.recentBatches')}
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
                <TableHead>{t('auditor.history.aiScore')}</TableHead>
                <TableHead>{t('auditor.history.compliance')}</TableHead>
                <TableHead className="text-right">{t('manufacturer.incoming.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.map(batch => (
                <TableRow key={batch.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-primary">{batch.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-primary/60" />{batch.herb_type}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{batch.farmer_name || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{batch.region || '-'}</TableCell>
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
                  <TableCell>{getComplianceBadge(batch.compliance_status)}</TableCell>
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
              {filteredBatches.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('auditor.history.noBatches')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts - 2x2 Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-botanical h-full">
          <CardHeader><CardTitle className="text-base">{t('auditor.dashboard.complianceStatus')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={complianceData} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {complianceData.map((_, i) => <Cell key={i} fill={COLORS_STATUS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-botanical h-full">
          <CardHeader><CardTitle className="text-base">{t('auditor.dashboard.regionDistribution')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={regionData} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                    label={({ name }) => name.split(' ')[0]} labelLine={false}>
                    {regionData.map((_, i) => <Cell key={i} fill={REGION_COLORS[i % REGION_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-botanical h-full">
          <CardHeader><CardTitle className="text-base">{t('auditor.dashboard.complianceTrend')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={complianceTrend}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="compliant" name={t('compliance.compliant')} stroke="hsl(142, 76%, 36%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="nonCompliant" name={t('compliance.nonCompliant')} stroke="hsl(0, 72%, 50%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-botanical h-full">
          <CardHeader><CardTitle className="text-base">{t('auditor.dashboard.herbComplianceRate')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={herbComplianceData}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-40} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="rate" fill="hsl(152, 45%, 38%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
