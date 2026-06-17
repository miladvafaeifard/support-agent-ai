'use client';

import Link from 'next/dist/client/link';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

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

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);


function fetchEscalatedTickets(msg?: string) {
console.log(msg);
  fetch('http://localhost:3001/tickets?status=escalated')
    .then(r => r.json())
    .then(setTickets);
}


useEffect(() => {
  const socket = io('http://localhost:3001');
  fetchEscalatedTickets('Initial fetch');

  socket.on('ticket:updated', (data: { ticketId: string; status: string }) => {
    if (data.status === 'escalated') {
      fetchEscalatedTickets('Ticket updated');
    }
  });

  return () => { socket.disconnect(); };
}, []);

  return (
    <main>
      <h1>Escalated Tickets</h1>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Email</th>
            <th>Category</th>
            <th>Urgency</th>
            <th>Summary</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t.id}>
              <td><Link href={`/dashboard/${t.id}`}>{t.subject}</Link></td>
              <td>{t.customer_email}</td>
              <td>{t.category}</td>
              <td>{t.urgency}</td>
              <td>{t.summary}</td>
              <td>{new Date(t.updated_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
