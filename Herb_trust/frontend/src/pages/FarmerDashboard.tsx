import { useState } from 'react';
import { Package, CheckCircle2, Clock, AlertCircle, Leaf, TrendingUp, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { mockBatches, dashboardStats, submissionTrend } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(0, 72%, 50%)', 'hsl(38, 92%, 50%)'];

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const stats = dashboardStats.farmer;

  const recentBatches = mockBatches.slice(0, 5);
  const filteredRecent = recentBatches.filter(b =>
    b.herbName.toLowerCase().includes(search.toLowerCase()) ||
    b.status.toLowerCase().includes(search.toLowerCase())
  );

  const statusData = [
    { name: 'Approved', value: stats.approved },
    { name: 'Rejected', value: stats.rejected },
    { name: 'Pending', value: stats.pendingVerification },
  ];

  const herbCounts: Record<string, number> = {};
  mockBatches.forEach(b => { herbCounts[b.herbType] = (herbCounts[b.herbType] || 0) + 1; });
  const herbBarData = Object.entries(herbCounts).map(([name, count]) => ({ name, count }));

  const statCards = [
    { label: 'Total Batches', value: stats.totalBatches, icon: Package, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Pending', value: stats.pendingVerification, icon: Clock, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle2, bg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Rejected', value: stats.rejected, icon: AlertCircle, bg: 'bg-red-50', iconColor: 'text-red-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, <span className="text-gradient-primary">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground mt-1">This is where data enters the system.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by herb name or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats Cards */}
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

      {/* Recent Submissions */}
      <Card className="card-botanical">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Recent Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRecent.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.herbName}</p>
                    <p className="text-xs text-muted-foreground">{item.id} • {item.harvestDate}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  item.status === 'approved' ? 'badge-approved' :
                  item.status === 'verified' ? 'bg-primary/10 text-primary border border-primary/20' :
                  item.status === 'blocked' ? 'badge-blocked' :
                  'badge-pending'
                }`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
            ))}
            {filteredRecent.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No matching batches found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">Status Distribution</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="text-base">Batches by Herb Type</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={herbBarData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(152, 45%, 38%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">Submission Trend (7 Days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={submissionTrend}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(142, 69%, 40%)" strokeWidth={2} dot={{ fill: 'hsl(142, 69%, 40%)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
