import { useState } from 'react';
import {
  Package, CheckCircle2, XCircle, Leaf, ChevronRight, Beaker, ShieldCheck, Clock, LineChart as LineChartIcon, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { mockBatches, HerbBatch } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ManufacturerIncoming() {
  const [selectedBatch, setSelectedBatch] = useState<HerbBatch | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockBatches.filter(b => {
    const matchSearch = b.herbName.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="badge-approved">Approved</Badge>;
      case 'blocked': return <Badge className="badge-blocked">Blocked</Badge>;
      case 'verified': return <Badge className="bg-primary/10 text-primary border border-primary/20">Verified</Badge>;
      default: return <Badge className="badge-pending">Pending</Badge>;
    }
  };

  const getScoreColor = (score: number) => score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-destructive';
  const getProgressColor = (score: number) => score >= 80 ? 'bg-success' : score >= 60 ? 'bg-warning' : 'bg-destructive';

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Incoming Batches</h1>
        <p className="text-muted-foreground mt-1">Review and manage incoming herb batches.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by herb name or batch ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="card-elevated">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Incoming Batches ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Herb</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>AI Score</TableHead>
                <TableHead>Potency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(batch => (
                <TableRow key={batch.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedBatch(batch)}>
                  <TableCell className="font-mono text-primary">{batch.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-primary/60" />{batch.herbName}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{batch.farmerName}</TableCell>
                  <TableCell><span className={`font-semibold ${getScoreColor(batch.aiScore)}`}>{batch.aiScore}%</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${getProgressColor(batch.potency)} transition-all`} style={{ width: `${batch.potency}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground">{batch.potency}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(batch.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-primary">View <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No batches found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
        <DialogContent className="max-w-3xl">
          {selectedBatch && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Leaf className="w-5 h-5 text-primary" /></div>
                  <div>
                    <span className="text-xl">{selectedBatch.herbName}</span>
                    <span className="ml-3 font-mono text-sm text-muted-foreground">{selectedBatch.id}</span>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/40 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-2"><Beaker className="w-4 h-4" />AI Authenticity Score</span>
                      <span className={`text-2xl font-bold ${getScoreColor(selectedBatch.aiScore)}`}>{selectedBatch.aiScore}%</span>
                    </div>
                    <Progress value={selectedBatch.aiScore} className="h-3" />
                  </div>
                  <div className="p-4 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Ecological Validity</span>
                    {selectedBatch.ecoValidity ? (
                      <span className="flex items-center gap-2 text-success"><CheckCircle2 className="w-5 h-5" />Valid</span>
                    ) : (
                      <span className="flex items-center gap-2 text-destructive"><XCircle className="w-5 h-5" />Invalid</span>
                    )}
                  </div>
                  <div className={`p-6 rounded-lg text-center ${
                    selectedBatch.complianceStatus === 'approved' ? 'bg-success/10 border-2 border-success/20' :
                    selectedBatch.complianceStatus === 'blocked' ? 'bg-destructive/10 border-2 border-destructive/20' :
                    'bg-warning/10 border-2 border-warning/20'
                  }`}>
                    <div className={`mb-2 ${
                      selectedBatch.complianceStatus === 'approved' ? 'text-success' :
                      selectedBatch.complianceStatus === 'blocked' ? 'text-destructive' : 'text-warning'
                    }`}>
                      {selectedBatch.complianceStatus === 'approved' ? <CheckCircle2 className="w-12 h-12 mx-auto" /> :
                       selectedBatch.complianceStatus === 'blocked' ? <XCircle className="w-12 h-12 mx-auto" /> :
                       <Clock className="w-12 h-12 mx-auto" />}
                    </div>
                    <p className="text-lg font-semibold capitalize">{selectedBatch.complianceStatus}</p>
                    <p className="text-xs text-muted-foreground mt-1">Compliance Status</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/40 border border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <LineChartIcon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Potency Timeline</span>
                      <span className="ml-auto text-lg font-bold text-primary">{selectedBatch.potency}%</span>
                    </div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedBatch.potencyHistory}>
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                          <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="hsl(142, 69%, 40%)" strokeWidth={2} dot={{ fill: 'hsl(142, 69%, 40%)' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Farmer', value: selectedBatch.farmerName },
                      { label: 'Region', value: selectedBatch.location.region },
                      { label: 'Quantity', value: `${selectedBatch.quantity} ${selectedBatch.unit}` },
                      { label: 'Harvest Date', value: selectedBatch.harvestDate },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-lg bg-muted/40">
                        <p className="text-muted-foreground">{item.label}</p>
                        <p className="font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {selectedBatch.complianceStatus !== 'blocked' && (
                <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                  <Button variant="outline" className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => setSelectedBatch(null)}>
                    <XCircle className="w-4 h-4 mr-2" />Reject Batch
                  </Button>
                  <Button className="flex-1 bg-gradient-primary" onClick={() => setSelectedBatch(null)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />Accept Batch
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
