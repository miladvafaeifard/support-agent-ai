'use client';

import { useEffect } from "react";
import { io } from "socket.io-client";

export default function Home() {

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socket.on('ticket:updated', (data) => {
      console.log('Ticket updated:', data);
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  
  return (
    <main>
      <h1>Support Agent</h1>
      <p>Customer chat widget lands here (week 1–2).</p>
      {/* Routes to build:
          /chat       – customer-facing chat widget
          /dashboard  – human agent queue + escalation review
          /admin      – analytics: AI resolution rate, confidence trends */}
    </main>
  );
}
