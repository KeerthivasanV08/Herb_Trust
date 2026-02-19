import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { getAllBatches } from '@/services/api';
import { useTranslation } from 'react-i18next';
import type { Batch } from '@/types/batch';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(0, 72%, 50%)', 'hsl(38, 92%, 50%)'];

export default function ManufacturerReports() {
  const { t } = useTranslation();
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

  const approved = batches.filter(b => b.compliance_status === 'Approved').length;
  const blocked = batches.filter(b => b.compliance_status === 'Rejected' || b.compliance_status === 'Fraud Suspected').length;
  const pending = batches.filter(b => !b.compliance_status).length;

  const statusData = [
    { name: t('manufacturer.reports.accepted'), value: approved },
    { name: t('manufacturer.reports.rejected'), value: blocked },
    { name: t('manufacturer.reports.pending'), value: pending },
  ];

  const avgScores: Record<string, { total: number; count: number }> = {};
  batches.forEach(b => {
    if (!avgScores[b.herb_type]) avgScores[b.herb_type] = { total: 0, count: 0 };
    if (b.authenticity_score !== null) {
      avgScores[b.herb_type].total += b.authenticity_score;
      avgScores[b.herb_type].count++;
    }
  });
  const avgScoreData = Object.entries(avgScores).map(([name, d]) => ({
    name, score: d.count > 0 ? Math.round(d.total / d.count) : 0,
  }));

  const qualityTrend = batches.slice(0, 6).map(b => ({
    batch: `#${b.id}`, score: b.authenticity_score || 0, potency: b.potency_score || 0,
  }));

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
        <h1 className="text-2xl font-bold text-foreground">{t('manufacturer.reports.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('manufacturer.reports.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">{t('manufacturer.reports.statusDistribution')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityTrend}>
                  <XAxis dataKey="batch" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" name={t('manufacturer.incoming.aiScore')} stroke="hsl(142, 69%, 40%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="potency" name={t('manufacturer.incoming.potency')} stroke="hsl(38, 92%, 50%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">{t('manufacturer.reports.avgScoreByHerb')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgScoreData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="score" fill="hsl(152, 45%, 38%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
