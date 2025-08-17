// src/SSEHub.ts
import type { Application, Request, Response } from 'express';
import { createSession, createChannel } from 'better-sse';

// Shape for what you’ll broadcast. Adjust as needed.
export type DonationEvent =
  | {
      kind: 'donation-created';
      /* payload: {
        id: string;
        amount: number;
        donor?: string;
        donatedAt?: string; // ISO timestamp
        note?: string;
      }; */
    }
  | { kind: 'heartbeat'; payload: { t: number } };

// One channel for everyone listening to donations.
const donationsChannel = createChannel();

/**
 * Express route handler for the SSE endpoint.
 * Registers each connecting client to the donations channel.
 */
export async function donationsStream(req: Request, res: Response) {
  const session = await createSession(req, res);
  donationsChannel.register(session);

  // Optional: send an immediate hello so clients know they’re connected
  session.push({ t: Date.now() }, 'hello');
}


/**
 * Broadcast a structured event to all subscribers.
 */
export function broadcast(event: DonationEvent) {
  donationsChannel.broadcast(event, event.kind);
}

/**
 * (Optional) simple heartbeat you can start from server bootstrap.
 */
let heartbeatTimer: NodeJS.Timeout | null = null;
export function startHeartbeat(ms = 30_000) {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(() => {
    donationsChannel.broadcast({ t: Date.now() }, 'heartbeat');
  }, ms);
}

/**
 * For metrics or UI: how many active SSE sessions?
 */
export function sessionCount() {
  return donationsChannel.sessionCount;
}
