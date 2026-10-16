/**
 * Server-Sent Events (SSE) in-memory broker for instant push notifications.
 * Attaches to globalThis to survive Next.js module reloads in development.
 */

export type SSEClient = {
  id: string;
  username: string;
  send: (data: string) => void;
};

const globalKey = Symbol.for('window_door_store.sse.clients');

// Map of lowercase username -> Set of active SSEClient connections
const clientsMap: Map<string, Set<SSEClient>> = 
  (globalThis as any)[globalKey] || new Map<string, Set<SSEClient>>();

(globalThis as any)[globalKey] = clientsMap;

/**
 * Register a connected client for real-time push
 */
export function addSSEClient(username: string, client: SSEClient) {
  if (!username) return;
  const key = username.toLowerCase().trim();
  if (!clientsMap.has(key)) {
    clientsMap.set(key, new Set());
  }
  clientsMap.get(key)!.add(client);
}

/**
 * Unregister a disconnected client
 */
export function removeSSEClient(username: string, client: SSEClient) {
  if (!username) return;
  const key = username.toLowerCase().trim();
  const set = clientsMap.get(key);
  if (set) {
    set.delete(client);
    if (set.size === 0) {
      clientsMap.delete(key);
    }
  }
}

/**
 * Push an event directly to a specific user's open browsers/tabs in sub-second real-time.
 */
export function pushToUser(username: string, eventData: any) {
  if (!username) return;
  const key = username.toLowerCase().trim();
  const set = clientsMap.get(key);
  if (set && set.size > 0) {
    const rawData = `data: ${JSON.stringify(eventData)}\n\n`;
    set.forEach(client => {
      try {
        client.send(rawData);
      } catch (err) {
        // Disconnected client will be cleaned up
      }
    });
  }
}

/**
 * Broadcast an event to all currently connected users (e.g. quote count changes)
 */
export function broadcastSSE(eventData: any) {
  const rawData = `data: ${JSON.stringify(eventData)}\n\n`;
  clientsMap.forEach(set => {
    set.forEach(client => {
      try {
        client.send(rawData);
      } catch (err) {
        // Disconnected client will be cleaned up
      }
    });
  });
}
