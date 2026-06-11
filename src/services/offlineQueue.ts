import { v4 as uuidv4 } from 'uuid';
import type { OfflineOperation, OfflineOperationType } from '@/domain/appTypes';

export function createOfflineOperation(
  type: OfflineOperationType,
  payload: unknown
): OfflineOperation {
  return {
    id: uuidv4(),
    type,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
  };
}
