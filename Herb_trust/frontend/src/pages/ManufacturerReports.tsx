import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockBatches, weeklyDecisionTrend } from '@/data/mockData';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(0, 72%, 50%)', 'hsl(38, 92%, 50%)'];

export default function ManufacturerReports() {
  const approved = mockBatches.filter(b => b.complianceStatus === 'approved').length;
  const blocked = mockBatches.filter(b => b.complianceStatus === 'blocked').length;
  const pending = mockBatches.filter(b => b.complianceStatus === 'pending').length;

  const statusData = [
    { name: 'Accepted', value: approved },
    { name: 'Rejected', value: blocked },
    { name: 'Pending', value: pending },
  ];

  const avgScores: Record<string, { total: number; count: number }> = {};
  mockBatches.forEach(b => {
    if (!avgScores[b.herbType]) avgScores[b.herbType] = { total: 0, count: 0 };
    avgScores[b.herbType].total += b.aiScore;
    avgScores[b.herbType].count++;
  });
  const avgScoreData = Object.entries(avgScores).map(([name, d]) => ({
    name, score: Math.round(d.total / d.count),
  }));

  const qualityTrend = mockBatches.slice(0, 6).map(b => ({
    batch: b.id, score: b.aiScore, potency: b.potency,
  }));

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quality Reports</h1>
        <p className="text-muted-foreground mt-1">Analyze quality trends and batch performance.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">Batch Decisions</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="text-base">Quality Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityTrend}>
                  <XAxis dataKey="batch" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" name="AI Score" stroke="hsl(142, 69%, 40%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="potency" name="Potency" stroke="hsl(38, 92%, 50%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">Avg Authenticity by Herb</CardTitle></CardHeader>
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
