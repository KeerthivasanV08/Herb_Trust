import { useState, useEffect } from 'react';
import { Package, CheckCircle2, XCircle, Clock, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getAllBatches } from '@/services/api';
import { useTranslation } from 'react-i18next';
import type { Batch } from '@/types/batch';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(0, 72%, 50%)', 'hsl(38, 92%, 50%)'];

export default function ManufacturerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
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

  const stats = {
    incomingBatches: batches.length,
    accepted: batches.filter(b => b.compliance_status === 'Approved').length,
    rejected: batches.filter(b => b.compliance_status === 'Rejected' || b.compliance_status === 'Fraud Suspected').length,
    pendingDecision: batches.filter(b => !b.compliance_status).length,
  };

  const statusData = [
    { name: t('manufacturer.dashboard.accepted'), value: stats.accepted },
    { name: t('manufacturer.dashboard.rejected'), value: stats.rejected },
    { name: t('compliance.pending'), value: stats.pendingDecision },
  ];

  const herbApproval: Record<string, { approved: number; total: number }> = {};
  batches.forEach(b => {
    if (!herbApproval[b.herb_type]) herbApproval[b.herb_type] = { approved: 0, total: 0 };
    herbApproval[b.herb_type].total++;
    if (b.compliance_status === 'Approved') herbApproval[b.herb_type].approved++;
  });
  const herbApprovalData = Object.entries(herbApproval).map(([name, d]) => ({
    name, rate: d.total > 0 ? Math.round((d.approved / d.total) * 100) : 0,
  }));

  // Calculate weekly decision trend from real data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const weeklyDecisionTrend = last7Days.map(date => {
    const dayBatches = batches.filter(b => b.created_at.startsWith(date));
    return {
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      approved: dayBatches.filter(b => b.compliance_status === 'Approved').length,
      rejected: dayBatches.filter(b => b.compliance_status === 'Rejected' || b.compliance_status === 'Fraud Suspected').length,
    };
  });

  const statCards = [
    { label: t('manufacturer.dashboard.totalReceived'), value: stats.incomingBatches, icon: Package, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', textColor: 'text-white', iconColor: 'text-white' },
    { label: t('manufacturer.dashboard.pending'), value: stats.pendingDecision, icon: Clock, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', textColor: 'text-white', iconColor: 'text-white' },
    { label: t('manufacturer.dashboard.accepted'), value: stats.accepted, icon: CheckCircle2, gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', textColor: 'text-white', iconColor: 'text-white' },
    { label: t('manufacturer.dashboard.rejected'), value: stats.rejected, icon: XCircle, gradient: 'bg-gradient-to-br from-purple-500 to-violet-600', textColor: 'text-white', iconColor: 'text-white' },
  ];

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
        <h1 className="text-2xl font-bold text-foreground">
          {t('manufacturer.dashboard.welcome')}, <span className="text-gradient-primary">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground mt-1">{t('manufacturer.dashboard.subtitle')}</p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t('common.search') + '...'} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">{t('manufacturer.dashboard.batchStatus')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">{t('manufacturer.dashboard.weeklyDecisions')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyDecisionTrend}>
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="accepted" name={t('manufacturer.dashboard.accepted')} stroke="hsl(142, 76%, 36%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="rejected" name={t('manufacturer.dashboard.rejected')} stroke="hsl(0, 72%, 50%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">{t('manufacturer.reports.avgScoreByHerb')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={herbApprovalData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
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
