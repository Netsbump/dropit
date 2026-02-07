import { NotificationRequest } from "../../../application/ports/outbound/notification.port";

/**
 * SMS Channel Port (Port OUT)
 *
 * @description
 * Defines the contract for sending SMS
 * This port is implemented by SmsAdapter in the infrastructure layer.
 *  
 */
export interface ISmsChannel {
    send(request: NotificationRequest): Promise<void>;
}

export const SMS_CHANNEL_PORT = Symbol('SMS_CHANNEL_PORT');
