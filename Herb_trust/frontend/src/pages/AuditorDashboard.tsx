import { useState } from 'react';
import {
  Shield, CheckCircle2, AlertTriangle, Globe, FileSearch, Leaf, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { mockBatches, dashboardStats, complianceTrend } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS_STATUS = ['hsl(142, 76%, 36%)', 'hsl(0, 72%, 50%)'];
const REGION_COLORS = ['hsl(152, 45%, 38%)', 'hsl(38, 92%, 50%)', 'hsl(200, 70%, 50%)', 'hsl(280, 60%, 50%)', 'hsl(340, 70%, 50%)', 'hsl(60, 70%, 45%)'];

export default function AuditorDashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const stats = dashboardStats.auditor;

  const recentBatches = mockBatches.slice(0, 10);
  const filteredBatches = recentBatches.filter(b =>
    b.herbName.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.complianceStatus.toLowerCase().includes(search.toLowerCase())
  );

  const complianceData = [
    { name: 'Compliant', value: stats.compliant },
    { name: 'Non-Compliant', value: stats.nonCompliant },
  ];

  const regionCounts: Record<string, number> = {};
  mockBatches.forEach(b => { regionCounts[b.location.region] = (regionCounts[b.location.region] || 0) + 1; });
  const regionData = Object.entries(regionCounts).map(([name, value]) => ({ name, value }));

  const herbCompliance: Record<string, { compliant: number; total: number }> = {};
  mockBatches.forEach(b => {
    if (!herbCompliance[b.herbType]) herbCompliance[b.herbType] = { compliant: 0, total: 0 };
    herbCompliance[b.herbType].total++;
    if (b.complianceStatus === 'approved') herbCompliance[b.herbType].compliant++;
  });
  const herbComplianceData = Object.entries(herbCompliance).map(([name, d]) => ({
    name, rate: Math.round((d.compliant / d.total) * 100),
  }));

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="badge-approved">Compliant</Badge>;
      case 'blocked': return <Badge className="badge-blocked">Non-Compliant</Badge>;
      default: return <Badge className="badge-pending">Under Review</Badge>;
    }
  };

  const statCards = [
    { label: 'Total Tracked', value: stats.totalTracked, icon: FileSearch, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Compliant', value: stats.compliant, icon: CheckCircle2, bg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Non-Compliant', value: stats.nonCompliant, icon: AlertTriangle, bg: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Regions', value: stats.regionsMonitored, icon: Globe, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, <span className="text-gradient-primary">{user?.name}</span>
          </h1>
          <p className="text-muted-foreground mt-1">This is governance without paperwork.</p>
        </div>
        <Badge variant="outline" className="w-fit px-4 py-2 border-primary/30 text-primary">
          <Eye className="w-4 h-4 mr-2" />Read-Only Access
        </Badge>
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

      {/* Recent Batches Table */}
      <Card className="card-elevated">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Recent Batches
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Herb</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>AI Score</TableHead>
                <TableHead>Compliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.map(batch => (
                <TableRow key={batch.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-primary">{batch.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-primary/60" />{batch.herbName}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{batch.farmerName}</TableCell>
                  <TableCell className="text-muted-foreground">{batch.location.region}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${batch.aiScore >= 80 ? 'text-success' : batch.aiScore >= 60 ? 'text-warning' : 'text-destructive'}`}>
                      {batch.aiScore}%
                    </span>
                  </TableCell>
                  <TableCell>{getComplianceBadge(batch.complianceStatus)}</TableCell>
                </TableRow>
              ))}
              {filteredBatches.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No batches found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">Compliance Status</CardTitle></CardHeader>
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

        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">Region Distribution</CardTitle></CardHeader>
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

        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">Compliance Trend (7 Days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={complianceTrend}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="compliant" stroke="hsl(142, 76%, 36%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="nonCompliant" name="Non-Compliant" stroke="hsl(0, 72%, 50%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-botanical">
          <CardHeader><CardTitle className="text-base">Herb Compliance Rate</CardTitle></CardHeader>
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
