import { NotificationRequest } from "../../../application/ports/outbound/notification.port";

/**
 * Email Channel Port (Port OUT)
 *
 * @description
 * Defines the contract for sending emails
 * This port is implemented by EmailAdapter in the infrastructure layer.
 *  
 */
export interface IEmailChannel {
  send(request: NotificationRequest): Promise<void>;
}

export const EMAIL_CHANNEL_PORT = Symbol('EMAIL_CHANNEL_PORT');