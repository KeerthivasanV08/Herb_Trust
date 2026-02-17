import { useState } from 'react';
import {
  Shield, CheckCircle2, AlertTriangle, Leaf, Hash, Filter, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { mockBatches, herbTypes } from '@/data/mockData';

export default function AuditorHistory() {
  const [search, setSearch] = useState('');
  const [herbFilter, setHerbFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  const regions = [...new Set(mockBatches.map(b => b.location.region))];

  const filtered = mockBatches.filter(b => {
    const matchSearch = b.herbName.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) || b.farmerName.toLowerCase().includes(search.toLowerCase());
    const matchHerb = herbFilter === 'all' || b.herbType === herbFilter;
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'compliant' && b.complianceStatus === 'approved') ||
      (statusFilter === 'non-compliant' && b.complianceStatus === 'blocked') ||
      (statusFilter === 'pending' && b.complianceStatus === 'pending');
    const matchRegion = regionFilter === 'all' || b.location.region === regionFilter;
    return matchSearch && matchHerb && matchStatus && matchRegion;
  });

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="badge-approved">Compliant</Badge>;
      case 'blocked': return <Badge className="badge-blocked">Non-Compliant</Badge>;
      default: return <Badge className="badge-pending">Under Review</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Batch History</h1>
        <p className="text-muted-foreground mt-1">Complete history of all tracked batches with blockchain verification.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search batches..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground"><Filter className="w-4 h-4" /></div>
        <Select value={herbFilter} onValueChange={setHerbFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Herb" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Herbs</SelectItem>
            {herbTypes.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="compliant">Compliant</SelectItem>
            <SelectItem value="non-compliant">Non-Compliant</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Region" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="card-elevated">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Complete Batch History ({filtered.length})
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
                <TableHead>Date</TableHead>
                <TableHead>AI Score</TableHead>
                <TableHead>Eco Valid</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Blockchain Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(batch => (
                <TableRow key={batch.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-primary">{batch.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-primary/60" />{batch.herbType}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{batch.farmerName}</TableCell>
                  <TableCell className="text-muted-foreground">{batch.location.region}</TableCell>
                  <TableCell className="text-muted-foreground">{batch.harvestDate}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${batch.aiScore >= 80 ? 'text-success' : batch.aiScore >= 60 ? 'text-warning' : 'text-destructive'}`}>
                      {batch.aiScore}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {batch.ecoValidity ? <CheckCircle2 className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-destructive" />}
                  </TableCell>
                  <TableCell>{getComplianceBadge(batch.complianceStatus)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">{batch.blockchainHash}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No batches found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
