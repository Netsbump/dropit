/**
 * Interface for email transport layer
 * Implementations: BrevoService (production), DevMailService (development)
 */
export interface IEmailService {
  /**
   * Send an email with HTML content
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param htmlContent - HTML content of the email
   */
  sendEmail(to: string, subject: string, htmlContent: string): Promise<void>;
}

/**
 * Injection token for IEmailService
 * Use this token in @Inject() decorators in services
 */
export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');