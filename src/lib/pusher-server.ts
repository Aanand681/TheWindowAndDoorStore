import Pusher from 'pusher';

let pusherInstance: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  if (pusherInstance) return pusherInstance;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';

  if (!appId || !key || !secret) {
    return null;
  }

  try {
    pusherInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
    return pusherInstance;
  } catch (err) {
    console.error('Failed to initialize Pusher server:', err);
    return null;
  }
}

/**
 * Triggers an instant WebSocket push event to a specific user or global channel.
 */
export async function triggerPusherEvent(channel: string, event: string, data: any) {
  const pusher = getPusherServer();
  if (!pusher) return;

  try {
    // Sanitize channel name (alphanumeric, underscore, dash)
    const sanitizedChannel = channel.replace(/[^a-zA-Z0-9_\-=@,.;]/g, '_');
    await pusher.trigger(sanitizedChannel, event, data);
  } catch (err) {
    console.error(`Pusher trigger error on channel [${channel}]:`, err);
  }
}
