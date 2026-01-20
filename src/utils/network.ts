import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
} from '@react-native-community/netinfo';

export type ConnectionType =
  | 'none'
  | 'unknown'
  | 'cellular'
  | 'wifi'
  | 'bluetooth'
  | 'ethernet'
  | 'other';

export interface NetworkStatus {
  isConnected: boolean;
  connectionType: ConnectionType;
  isInternetReachable: boolean | null;
  details: NetInfoState['details'] | null;
}

const getConnectionType = (type: NetInfoState['type']): ConnectionType => {
  switch (type) {
    case 'none':
      return 'none';
    case 'cellular':
      return 'cellular';
    case 'wifi':
      return 'wifi';
    case 'bluetooth':
      return 'bluetooth';
    case 'ethernet':
      return 'ethernet';
    default:
      return 'unknown';
  }
};

export const useNetwork = (): NetworkStatus => {
  const [networkState, setNetworkState] = useState<NetworkStatus>({
    isConnected: true,
    connectionType: 'unknown',
    isInternetReachable: null,
    details: null,
  });

  useEffect(() => {
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        connectionType: getConnectionType(state.type),
        isInternetReachable: state.isInternetReachable,
        details: state.details,
      });
    });

    NetInfo.fetch().then(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        connectionType: getConnectionType(state.type),
        isInternetReachable: state.isInternetReachable,
        details: state.details,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkState;
};

export const useIsConnected = (): boolean => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isConnected;
};

export const useConnectionType = (): ConnectionType => {
  const [connectionType, setConnectionType] =
    useState<ConnectionType>('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setConnectionType(getConnectionType(state.type));
    });

    NetInfo.fetch().then(state => {
      setConnectionType(getConnectionType(state.type));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return connectionType;
};

export const useIsInternetReachable = (): boolean | null => {
  const [isInternetReachable, setIsInternetReachable] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsInternetReachable(state.isInternetReachable);
    });

    NetInfo.fetch().then(state => {
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isInternetReachable;
};

class NetworkMonitor {
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private subscription: NetInfoSubscription | null = null;
  private isMonitoring = false;

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.subscription = NetInfo.addEventListener(state => {
      const status: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        connectionType: getConnectionType(state.type),
        isInternetReachable: state.isInternetReachable,
        details: state.details,
      };

      this.listeners.forEach(listener => listener(status));
    });

    this.isMonitoring = true;
  }

  stopMonitoring(): void {
    if (!this.isMonitoring || !this.subscription) return;

    this.subscription();
    this.subscription = null;
    this.isMonitoring = false;
  }

  addListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async getCurrentStatus(): Promise<NetworkStatus> {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      connectionType: getConnectionType(state.type),
      isInternetReachable: state.isInternetReachable,
      details: state.details,
    };
  }

  async isConnectedToInternet(): Promise<boolean> {
    const status = await this.getCurrentStatus();
    return status.isConnected && status.isInternetReachable !== false;
  }
}

export const networkMonitor = new NetworkMonitor();

export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const status = await networkMonitor.getCurrentStatus();
    return status.isConnected && status.isInternetReachable !== false;
  } catch {
    return false;
  }
};

export const waitForConnection = async (
  timeout: number = 30000,
  interval: number = 1000
): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const isConnected = await checkInternetConnection();
    if (isConnected) return true;
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return false;
};

export const onConnectionChange = (
  callback: (isConnected: boolean) => void
): (() => void) => {
  return NetInfo.addEventListener(state => {
    callback(state.isConnected ?? false);
  });
};

export const getConnectionQuality = (
  connectionType: ConnectionType,
  isInternetReachable: boolean | null
): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' => {
  if (!isInternetReachable) return 'offline';

  switch (connectionType) {
    case 'wifi':
      return 'excellent';
    case 'ethernet':
      return 'excellent';
    case 'cellular':
      return 'good';
    case 'bluetooth':
      return 'fair';
    default:
      return 'fair';
  }
};

export const CONNECTION_LABELS: Record<ConnectionType, string> = {
  none: 'No Connection',
  unknown: 'Unknown',
  cellular: 'Cellular',
  wifi: 'WiFi',
  bluetooth: 'Bluetooth',
  ethernet: 'Ethernet',
  other: 'Other',
};

export const isHighBandwidthConnection = (
  connectionType: ConnectionType
): boolean => {
  return connectionType === 'wifi' || connectionType === 'ethernet';
};

export const isLowBandwidthConnection = (
  connectionType: ConnectionType
): boolean => {
  return connectionType === 'cellular' || connectionType === 'bluetooth';
};
