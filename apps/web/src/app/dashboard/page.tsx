'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ThemeToggle } from '@/components/theme-toggle';

type Ticket = {
  id: string;
  customer_email: string;
  subject: string;
  summary: string;
  category: string;
  urgency: string;
  status: string;
  updated_at: string;
};

const urgencyVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
};

const categoryColors: Record<string, string> = {
  billing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  technical: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  account: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  function fetchEscalatedTickets() {
    fetch('http://localhost:3001/tickets?status=escalated')
      .then(r => r.json())
      .then(data => {
        setTickets(data);
        setLastUpdated(new Date());
        setLoading(false);
      });
  }

  useEffect(() => {
    const socket = io('http://localhost:3001');
    fetchEscalatedTickets();

    socket.on('ticket:updated', (data: { ticketId: string; status: string }) => {
      if (data.status === 'escalated') fetchEscalatedTickets();
    });

    return () => { socket.disconnect(); };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Support Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Escalated tickets requiring attention
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Escalated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{loading ? '—' : tickets.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical / High</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-destructive">
                {loading ? '—' : tickets.filter(t => t.urgency === 'critical' || t.urgency === 'high').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Most Recent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium truncate">
                {loading ? '—' : tickets[0]?.subject ?? 'None'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Subject</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="pr-6">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      No escalated tickets
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map(t => (
                    <TableRow key={t.id} className="hover:bg-muted/50 cursor-pointer">
                      <TableCell className="pl-6 font-medium">
                        <Link
                          href={`/dashboard/${t.id}`}
                          className="hover:underline text-foreground"
                        >
                          {t.subject}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{t.customer_email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${categoryColors[t.category.toLowerCase()] ?? categoryColors.general}`}>
                          {t.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={urgencyVariant[t.urgency.toLowerCase()] ?? 'outline'} className="capitalize">
                          {t.urgency}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs text-sm text-muted-foreground truncate">
                        {t.summary}
                      </TableCell>
                      <TableCell className="pr-6 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(t.updated_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
