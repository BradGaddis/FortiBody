const ADMIN_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

type OnUpdateCallback = (entity: string, data: any[]) => void;

const connectWebSocket = (onUpdate?: OnUpdateCallback, exercises?: any[]) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return;
  }

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[AdminSync] Connected to admin server');
      ws?.send(JSON.stringify({ type: 'identify', role: 'app', exercises }));
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        const entity = type.replace('_updated', '');
        if (onUpdate && typeof onUpdate === 'function') {
          onUpdate(entity, payload);
        }
      } catch (error) {
        console.error('[AdminSync] Failed to parse WS message:', error);
      }
    };

    ws.onclose = () => {
      console.log('[AdminSync] Disconnected from admin server');
      reconnectTimeout = setTimeout(() => {
        connectWebSocket(onUpdate);
      }, 3000);
    };

    ws.onerror = (error: Event) => {
      console.error('[AdminSync] WS error:', error);
    };
  } catch (error) {
    console.error('[AdminSync] Failed to connect:', error);
  }
};

const disconnectWebSocket = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
};

const fetchExercises = async (): Promise<any[] | null> => {
  try {
    const response = await fetch(`${ADMIN_URL}/api/exercises`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('[AdminSync] Failed to fetch exercises:', error);
    return null;
  }
};

const fetchRoutines = async (): Promise<any[] | null> => {
  try {
    const response = await fetch(`${ADMIN_URL}/api/routines`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('[AdminSync] Failed to fetch routines:', error);
    return null;
  }
};

const fetchModules = async (): Promise<any[] | null> => {
  try {
    const response = await fetch(`${ADMIN_URL}/api/modules`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('[AdminSync] Failed to fetch modules:', error);
    return null;
  }
};

const checkAdminHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${ADMIN_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const adminSync = {
  connect: connectWebSocket,
  disconnect: disconnectWebSocket,
  fetchExercises,
  fetchRoutines,
  fetchModules,
  checkHealth: checkAdminHealth
};

export default adminSync;
