import { useState, useEffect } from 'react';
import { Package, CheckCircle2, Clock, AlertCircle, Leaf, TrendingUp, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getAllBatches } from '@/services/api';
import type { Batch } from '@/types/batch';
import { useTranslation } from 'react-i18next';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(0, 72%, 50%)', 'hsl(38, 92%, 50%)'];

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real batches from Supabase via Django API
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await getAllBatches();
        setBatches(data);
      } catch (err) {
        setError(t('common.error'));
        console.error('Error fetching batches:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  // Calculate stats from REAL backend data
  const stats = {
    totalBatches: batches.length,
    approved: batches.filter(b => b.compliance_status === 'Approved').length,
    rejected: batches.filter(
      b => b.compliance_status === 'Rejected' || b.compliance_status === 'Fraud Suspected'
    ).length,
    pendingVerification: batches.filter(b => !b.compliance_status).length,
  };

  const recentBatches = batches.slice(0, 5);
  const filteredRecent = recentBatches.filter(b =>
    b.herb_type.toLowerCase().includes(search.toLowerCase()) ||
    (b.compliance_status && b.compliance_status.toLowerCase().includes(search.toLowerCase()))
  );

  const statusData = [
    { name: t('compliance.approved'), value: stats.approved },
    { name: t('compliance.rejected'), value: stats.rejected },
    { name: t('compliance.pending'), value: stats.pendingVerification },
  ];

  const herbCounts: Record<string, number> = {};
  batches.forEach(b => { herbCounts[b.herb_type] = (herbCounts[b.herb_type] || 0) + 1; });
  const herbBarData = Object.entries(herbCounts).map(([name, count]) => ({ name, count }));

  // Calculate 7-day submission trend from real data
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  
  const submissionTrend = last7Days.map(date => {
    const count = batches.filter(b => b.harvest_date.startsWith(date)).length;
    return { day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), count };
  });

  const statCards = [
    { label: t('farmer.dashboard.totalBatches'), value: stats.totalBatches, icon: Package, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', textColor: 'text-white', iconColor: 'text-white' },
    { label: t('farmer.dashboard.pending'), value: stats.pendingVerification, icon: Clock, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', textColor: 'text-white', iconColor: 'text-white' },
    { label: t('farmer.dashboard.approved'), value: stats.approved, icon: CheckCircle2, gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', textColor: 'text-white', iconColor: 'text-white' },
    { label: t('farmer.dashboard.rejected'), value: stats.rejected, icon: AlertCircle, gradient: 'bg-gradient-to-br from-purple-500 to-violet-600', textColor: 'text-white', iconColor: 'text-white' },
  ];

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
          <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t('farmer.dashboard.welcome')}, <span className="text-gradient-primary">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('farmer.dashboard.subtitle')}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('common.search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Card key={s.label} className={`border-0 ${s.gradient} overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${s.textColor} opacity-90 mb-2`}>{s.label}</p>
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

      {/* Recent Submissions */}
      <Card className="card-botanical">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t('farmer.dashboard.recentSubmissions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRecent.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {batches.length === 0 ? t('farmer.batches.noBatches') : t('farmer.batches.noBatches')}
              </p>
            ) : (
              filteredRecent.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.herb_type}</p>
                      <p className="text-xs text-muted-foreground">Batch #{item.id} • {new Date(item.harvest_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t('farmer.batches.aiScore')}</p>
                      <p className={`text-sm font-semibold ${
                        item.authenticity_score !== null && item.authenticity_score >= 75 
                          ? 'text-success' 
                          : item.authenticity_score !== null && item.authenticity_score >= 40
                          ? 'text-warning' 
                          : 'text-destructive'
                      }`}>
                        {item.authenticity_score !== null ? `${item.authenticity_score.toFixed(1)}%` : '-'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.compliance_status === 'Approved' ? 'badge-approved' : 
                      item.compliance_status === 'Rejected' || item.compliance_status === 'Fraud Suspected' ? 'badge-blocked' : 
                      'badge-pending'
                    }`}>
                      {item.compliance_status === 'Approved' ? t('compliance.approved') :
                       item.compliance_status === 'Rejected' ? t('compliance.rejected') :
                       item.compliance_status === 'Fraud Suspected' ? t('compliance.fraudSuspected') :
                       t('compliance.pending')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">{t('manufacturer.dashboard.batchStatus')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">{t('manufacturer.reports.avgScoreByHerb')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={herbBarData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name={t('chart.count')} fill="hsl(152, 45%, 38%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">{t('farmer.dashboard.submissionTrend')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={submissionTrend}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" name={t('chart.count')} stroke="hsl(142, 69%, 40%)" strokeWidth={2} dot={{ fill: 'hsl(142, 69%, 40%)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
