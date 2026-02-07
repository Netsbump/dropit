import { NotificationServiceNotConfiguredException } from "src/modules/notification/application/exceptions/notification.exceptions";
import { NotificationRequest } from "../../../application/ports/outbound/notification.port";
import { IPushChannel } from "./push-channel.port";

export class PushAdapter implements IPushChannel {
    constructor(

    ) { }


    async send(request: NotificationRequest): Promise<void> {
        // TODO: Implement push notification when push service is available
        throw new NotificationServiceNotConfiguredException('Push');
    
        // When implemented:
        // try {
        //   call firebase service
        // } catch (error) {
        //   throw new PushSendFailedException(
        //     `Failed to send push notification to user ${params.userId}: ${error.message}`
        //   );
        // }
      }
}