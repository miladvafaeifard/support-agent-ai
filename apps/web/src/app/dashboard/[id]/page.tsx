'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';

type Ticket = {
  id: string;
  customer_email: string;
  subject: string;
  body: string;
  status: string;
  category: string;
  sentiment: number;
  urgency: string;
  summary: string;
  language: string;
  updated_at: string;
};

const urgencyVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
};

function SentimentBar({ value }: { value: number }) {
  const pct = Math.round(((value + 1) / 2) * 100);
  const color = pct >= 60 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const label = pct >= 60 ? 'Positive' : pct >= 40 ? 'Neutral' : 'Negative';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/tickets/${id}`)
      .then(r => r.json())
      .then(setTicket);
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">← Back</Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm text-muted-foreground">Ticket Detail</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        {!ticket ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <div className="grid grid-cols-3 gap-4 mt-6">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
            <Skeleton className="h-40" />
            <Skeleton className="h-60" />
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
                <Badge variant={urgencyVariant[ticket.urgency.toLowerCase()] ?? 'outline'} className="capitalize shrink-0">
                  {ticket.urgency}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                From <span className="font-medium text-foreground">{ticket.customer_email}</span>
                {' · '}
                {new Date(ticket.updated_at).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="capitalize">{ticket.status}</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium capitalize">{ticket.category}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Language</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium uppercase">{ticket.language}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentBar value={ticket.sentiment} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{ticket.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Original Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{ticket.body}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
