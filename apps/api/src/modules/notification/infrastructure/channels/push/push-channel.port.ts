import { NotificationRequest } from '../../../application/ports/outbound/notification.port';

/**
 * Push Channel Port (Port OUT)
 *
 * @description
 * Defines the contract for sending push notifications
 * This port is implemented by PushAdapter in the infrastructure layer.
 *
 */
export interface IPushChannel {
  send(request: NotificationRequest): Promise<void>;
}

export const PUSH_CHANNEL_PORT = Symbol('PUSH_CHANNEL_PORT');
