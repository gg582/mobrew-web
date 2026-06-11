import { useEffect, useState } from 'react';
import { useOfflineQueueStore } from '@/stores/offlineQueueStore';

let registrationPromise: Promise<ServiceWorkerRegistration> | null = null;

function ensureRegistered(): Promise<ServiceWorkerRegistration> | null {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker.register('/sw.js');
  }
  return registrationPromise;
}

interface SWState {
  registration: ServiceWorkerRegistration | null;
  isControlled: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
}

export function useServiceWorker(): SWState {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isControlled, setIsControlled] = useState(
    typeof navigator !== 'undefined' && 'serviceWorker' in navigator
      ? navigator.serviceWorker.controller !== null
      : false
  );
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleControllerChange = () => {
      setIsControlled(navigator.serviceWorker.controller !== null);
    };

    const handleOnline = () => {
      setIsOnline(true);
      useOfflineQueueStore.getState().setOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      useOfflineQueueStore.getState().setOnline(false);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'MOBREW_SYNC') {
        useOfflineQueueStore.getState().processQueue();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker.addEventListener('message', handleMessage);

    const promise = ensureRegistered();
    if (promise) {
      promise
        .then((reg) => {
          setRegistration(reg);
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          });
        })
        .catch(() => {});
    }

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  return { registration, isControlled, isOnline, updateAvailable };
}

export function registerServiceWorker(): void {
  ensureRegistered();
}
