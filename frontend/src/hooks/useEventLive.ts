import { useEffect, useRef, useState } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import apiService from '@services/api';

export type EventLiveKind = 'REGISTERED' | 'CANCELLED' | 'UPDATED' | 'DELETED';

export interface EventLiveUpdate {
  eventId: string;
  registeredVolunteers: number;
  requiredVolunteers: number;
  status: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';
  kind: EventLiveKind;
  at: string;
}

const EVENT_SERVICE_WS_URL =
  import.meta.env.VITE_EVENT_SERVICE_WS_URL ?? 'http://localhost:8082/ws';

/**
 * Subscribes to live updates for one event. Returns the latest update payload
 * (or null while waiting). Handles reconnect, JWT auth, and cleanup.
 */
export function useEventLive(eventId: string | undefined): EventLiveUpdate | null {
  const [latest, setLatest] = useState<EventLiveUpdate | null>(null);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const accessToken = apiService.getAccessToken();
    if (!accessToken) {
      // Live updates require an authenticated session. Polling would be the
      // fallback but isn't worth implementing for a portfolio demo.
      return;
    }

    const client = new Client({
      // SockJS gives us automatic transport fallback (WebSocket → XHR streaming).
      webSocketFactory: () => new SockJS(EVENT_SERVICE_WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        const sub = client.subscribe(`/topic/events/${eventId}`, (msg: IMessage) => {
          try {
            const payload = JSON.parse(msg.body) as EventLiveUpdate;
            setLatest(payload);
          } catch {
            // Ignore malformed payloads — broadcast contract is fixed on backend.
          }
        });
        subscriptionRef.current = sub;
      },
      onStompError: () => {
        // Silently surface — UI stays on cached values.
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      try {
        subscriptionRef.current?.unsubscribe();
      } catch {
        // ignore
      }
      subscriptionRef.current = null;
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [eventId]);

  return latest;
}
