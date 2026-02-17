import { useState } from 'react';
import { Package, CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { mockBatches, dashboardStats, weeklyDecisionTrend } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(0, 72%, 50%)', 'hsl(38, 92%, 50%)'];

export default function ManufacturerDashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const stats = dashboardStats.manufacturer;

  const statusData = [
    { name: 'Accepted', value: stats.accepted },
    { name: 'Rejected', value: stats.rejected },
    { name: 'Pending', value: stats.pendingDecision },
  ];

  const herbApproval: Record<string, { approved: number; total: number }> = {};
  mockBatches.forEach(b => {
    if (!herbApproval[b.herbType]) herbApproval[b.herbType] = { approved: 0, total: 0 };
    herbApproval[b.herbType].total++;
    if (b.complianceStatus === 'approved') herbApproval[b.herbType].approved++;
  });
  const herbApprovalData = Object.entries(herbApproval).map(([name, d]) => ({
    name, rate: Math.round((d.approved / d.total) * 100),
  }));

  const statCards = [
    { label: 'Incoming Batches', value: stats.incomingBatches, icon: Package, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Pending Decision', value: stats.pendingDecision, icon: Clock, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { label: 'Accepted', value: stats.accepted, icon: CheckCircle2, bg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, bg: 'bg-red-50', iconColor: 'text-red-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, <span className="text-gradient-primary">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground mt-1">This is where trust matters.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search batches..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Card key={s.label} className="card-botanical transition-glow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{s.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${s.bg}`}>
                  <s.icon className={`w-6 h-6 ${s.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">Decision Distribution</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="text-base">Weekly Decision Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyDecisionTrend}>
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="accepted" stroke="hsl(142, 76%, 36%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="rejected" stroke="hsl(0, 72%, 50%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">Herb-wise Approval Rate</CardTitle></CardHeader>
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
