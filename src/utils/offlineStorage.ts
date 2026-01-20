import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkInternetConnection, useIsConnected } from './network';
import { useState, useEffect, useCallback } from 'react';

const PENDING_SYNC_KEY = '@fortibody_pending_sync';
const LAST_SYNC_KEY = '@fortibody_last_sync';
const SYNC_QUEUE_KEY = '@fortibody_sync_queue';

export type SyncStatus = 'idle' | 'syncing' | 'pending' | 'error' | 'offline';

export interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  retries: number;
  error?: string;
}

export interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  lastSyncTime: number | null;
  error: string | null;
}

class OfflineStorage {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await AsyncStorage.getItem(PENDING_SYNC_KEY);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
    }
  }

  async saveOffline<T>(
    key: string,
    data: T,
    queueForSync: boolean = false
  ): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);

      if (queueForSync) {
        await this.addToSyncQueue({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'create',
          entity: key,
          data,
          timestamp: Date.now(),
          retries: 0,
        });
      }
    } catch (error) {
      console.error('Failed to save offline data:', error);
      throw error;
    }
  }

  async getOffline<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  async deleteOffline(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to delete offline data:', error);
    }
  }

  async addToSyncQueue(item: SyncItem): Promise<void> {
    try {
      const existing = await this.getSyncQueue();
      const updated = [...existing, item];
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  async getSyncQueue(): Promise<SyncItem[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch {
      return [];
    }
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const filtered = queue.filter(item => item.id !== id);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
    }
  }

  async updateSyncQueueItem(
    id: string,
    updates: Partial<SyncItem>
  ): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const updated = queue.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update sync queue item:', error);
    }
  }

  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }

  async getPendingSyncCount(): Promise<number> {
    const queue = await this.getSyncQueue();
    return queue.length;
  }

  async setLastSyncTime(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
    } catch (error) {
      console.error('Failed to set last sync time:', error);
    }
  }

  async getLastSyncTime(): Promise<number | null> {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch {
      return null;
    }
  }

  async syncData(syncFunction: (item: SyncItem) => Promise<void>): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      return { success: 0, failed: 0, errors: [] };
    }

    const queue = await this.getSyncQueue();
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        await syncFunction(item);
        await this.removeFromSyncQueue(item.id);
        success++;
      } catch (error) {
        const errorMessage = (error as Error).message;

        if (item.retries < 3) {
          await this.updateSyncQueueItem(item.id, {
            retries: item.retries + 1,
            error: errorMessage,
          });
        } else {
          await this.removeFromSyncQueue(item.id);
          errors.push(`Item ${item.id}: ${errorMessage}`);
        }
        failed++;
      }
    }

    if (success > 0) {
      await this.setLastSyncTime(Date.now());
    }

    return { success, failed, errors };
  }

  async getSyncState(): Promise<SyncState> {
    const pendingCount = await this.getPendingSyncCount();
    const lastSyncTime = await this.getLastSyncTime();
    const isConnected = await checkInternetConnection();

    return {
      status: isConnected ? (pendingCount > 0 ? 'pending' : 'idle') : 'offline',
      pendingCount,
      lastSyncTime,
      error: null,
    };
  }
}

export const offlineStorage = new OfflineStorage();

export const useOfflineStorage = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const isConnected = useIsConnected();

  const refreshState = useCallback(async () => {
    const count = await offlineStorage.getPendingSyncCount();
    const lastSync = await offlineStorage.getLastSyncTime();
    setPendingCount(count);
    setLastSyncTime(lastSync);

    if (!isConnected) {
      setSyncStatus('offline');
    } else if (count > 0) {
      setSyncStatus('pending');
    } else {
      setSyncStatus('idle');
    }
  }, [isConnected]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  return {
    pendingCount,
    syncStatus,
    lastSyncTime,
    isConnected,
    refreshState,
    saveOffline: offlineStorage.saveOffline.bind(offlineStorage),
    getOffline: offlineStorage.getOffline.bind(offlineStorage),
    deleteOffline: offlineStorage.deleteOffline.bind(offlineStorage),
    syncData: offlineStorage.syncData.bind(offlineStorage),
  };
};

export const formatLastSyncTime = (timestamp: number | null): string => {
  if (!timestamp) return 'Never';

  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export default offlineStorage;
