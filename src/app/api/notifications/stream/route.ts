import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { addSSEClient, removeSSEClient, SSEClient } from '@/lib/sse-broker';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const username = (session.user as any).name || (session.user as any).username;
  if (!username) {
    return new Response('No username found', { status: 400 });
  }

  const clientId = Math.random().toString(36).substring(2, 9);
  const encoder = new TextEncoder();

  let keepAliveInterval: NodeJS.Timeout | null = null;
  let clientRef: SSEClient | null = null;

  const stream = new ReadableStream({
    start(controller) {
      clientRef = {
        id: clientId,
        username,
        send: (rawText: string) => {
          try {
            controller.enqueue(encoder.encode(rawText));
          } catch (err) {
            // Controller closed
          }
        },
      };

      addSSEClient(username, clientRef);

      // Send initial connect ack
      const initialAck = `data: ${JSON.stringify({ type: 'CONNECTED', username, timestamp: Date.now() })}\n\n`;
      controller.enqueue(encoder.encode(initialAck));

      // Keep connection alive with periodic comments every 20s
      keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch (err) {
          if (keepAliveInterval) clearInterval(keepAliveInterval);
        }
      }, 20000);
    },
    cancel() {
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      if (clientRef) removeSSEClient(username, clientRef);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable proxy buffering (Nginx, Vercel, etc.)
    },
  });
}
