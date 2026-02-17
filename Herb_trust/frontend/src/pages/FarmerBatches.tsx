import { useState } from 'react';
import { Package, Leaf, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { mockBatches } from '@/data/mockData';

export default function FarmerBatches() {
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
      case 'blocked': return <Badge className="badge-blocked">Rejected</Badge>;
      case 'verified': return <Badge className="bg-primary/10 text-primary border border-primary/20">Verified</Badge>;
      default: return <Badge className="badge-pending">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Batches</h1>
        <p className="text-muted-foreground mt-1">View and track all your submitted harvest batches.</p>
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
            <SelectItem value="blocked">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="card-elevated">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Submitted Batches ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Herb</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Harvest Date</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>AI Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(batch => (
                <TableRow key={batch.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-primary">{batch.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-primary/60" />
                      {batch.herbName}
                    </div>
                  </TableCell>
                  <TableCell>{batch.quantity} {batch.unit}</TableCell>
                  <TableCell className="text-muted-foreground">{batch.harvestDate}</TableCell>
                  <TableCell className="text-muted-foreground">{batch.location.region}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${batch.aiScore >= 80 ? 'text-success' : batch.aiScore >= 60 ? 'text-warning' : 'text-destructive'}`}>
                      {batch.aiScore}%
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(batch.status)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No batches found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
