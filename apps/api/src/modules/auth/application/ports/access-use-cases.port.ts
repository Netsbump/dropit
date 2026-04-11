import { RequestAccess } from "@dropit/schemas";

/**
* Access Use Cases Port
*
* @description
* Define the contract for access business operations.
* This interface ensures the application layer remains independent
* from any framework (NestJS, Express, etc.)
*
* @remarks
* Following hexagonal architecture, this port is implemented by
* AccessUseCases and injected into controllers via dependency injection.
*/
export interface IAccessUseCases {

  /**
  * Create request access to new user to backoffice coach management app
  */
  createAccess(data: RequestAccess): Promise<void>;
}

/**
* Injection token for IAccessUseCases
* Use this token in @Inject() decorators in controllers
*/
export const ACCESS_USE_CASES = Symbol('ACCESS_USE_CASES');
