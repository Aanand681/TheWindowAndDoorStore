import PusherClient from 'pusher-js';

let clientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient | null {
  if (typeof window === 'undefined') return null;
  if (clientInstance) return clientInstance;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || '2d0bf883d58265934c46';
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';

  if (!key) return null;

  try {
    clientInstance = new PusherClient(key, {
      cluster,
      forceTLS: true,
    });
    return clientInstance;
  } catch (err) {
    console.error('Failed to initialize Pusher client:', err);
    return null;
  }
}
