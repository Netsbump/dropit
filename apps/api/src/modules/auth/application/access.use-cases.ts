import { RequestAccess } from "@dropit/schemas";
import { IAccessUseCases } from "./ports/access-use-cases.port";
import { INotificationUseCases } from "../../notification/application/ports/inbound/notification-use-cases.port";

export class AccessUseCases implements IAccessUseCases {

  constructor(
    private readonly notificationUseCases: INotificationUseCases
  ) { }

  async createAccess(data: RequestAccess): Promise<void> {
    await this.notificationUseCases.sendRequestAccess(data);
  }
}
