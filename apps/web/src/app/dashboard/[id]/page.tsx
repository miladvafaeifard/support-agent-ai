'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/tickets/${id}`)
      .then(r => r.json())
      .then(setTicket);
  }, [id]);

  if (!ticket) return <p>Loading...</p>;

  return (
    <main>
      <h1>{ticket.subject}</h1>
      <p><strong>From:</strong> {ticket.customer_email}</p>
      <p><strong>Status:</strong> {ticket.status}</p>
      <p><strong>Category:</strong> {ticket.category} | <strong>Urgency:</strong> {ticket.urgency} | <strong>Sentiment:</strong> {ticket.sentiment}</p>
      <h2>AI Summary</h2>
      <p>{ticket.summary}</p>
      <h2>Original Message</h2>
      <p>{ticket.body}</p>
    </main>
  );
}
