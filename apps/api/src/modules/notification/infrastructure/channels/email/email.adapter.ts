
import { config } from "src/config/env.config";
import { KIND, NotificationRequest } from "../../../application/ports/outbound/notification.port";
import { BrevoAdapter } from "./brevo.adapter";
import { IEmailChannel } from "./email-channel.port";
import { MaildevAdapter } from "./maildev.adapter";

export class EmailAdapter implements IEmailChannel {
    
    constructor(
        private readonly isProduction = config.env === 'production',
        private readonly brevoAdapter: BrevoAdapter,
        private readonly maildevAdapter: MaildevAdapter,
    ) { }

    async send(request: NotificationRequest): Promise<void> {
        if (this.isProduction) {
            await this.brevoAdapter.send(request);
        } else {
            await this.maildevAdapter.send(request);
        }
    }
}

