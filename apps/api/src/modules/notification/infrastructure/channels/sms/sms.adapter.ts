import { NotificationServiceNotConfiguredException } from "../../exceptions/infrastructure.exceptions";
import { NotificationRequest } from "../../../application/ports/outbound/notification.port";
import { ISmsChannel } from "./sms-channel.port";

export class SmsAdapter implements ISmsChannel {
  async send(request: NotificationRequest): Promise<void> {
    // TODO: Implement SMS sending when SMS service is available
    throw new NotificationServiceNotConfiguredException("SMS");

    // When implemented:
    // if (!this.smsPort) {
    //   throw new NotificationServiceNotConfiguredException('SMS');
    // }
    // try {
    //   await this.smsPort.send(params);
    // } catch (error) {
    //   throw new SmsSendFailedException(
    //     `Failed to send SMS to ${params.to}: ${error.message}`
    //   );
    // }
  }
}
