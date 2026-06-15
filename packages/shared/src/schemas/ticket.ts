import { z } from "zod";

export const TicketStatus = z.enum([
  "new",          // just created, waiting for triage
  "triaged",      // classified, queued for resolution attempt
  "resolving",    // resolution agent working on it
  "resolved",     // AI answered with sufficient confidence
  "escalated",    // routed to a human queue
  "closed",       // human confirmed resolution
]);
export type TicketStatus = z.infer<typeof TicketStatus>;

export const Ticket = z.object({
  id: z.string().uuid(),
  customerEmail: z.string().email(),
  subject: z.string(),
  status: TicketStatus,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Ticket = z.infer<typeof Ticket>;
