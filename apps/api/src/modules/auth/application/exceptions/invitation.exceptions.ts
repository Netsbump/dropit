export class InvitationException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'InvitationException';
  }

  static notFound(invitationId: string): InvitationException {
    return new InvitationException(`Invitation with ID ${invitationId} not found`, 404);
  }

  static expiredOrUsed(): InvitationException {
    return new InvitationException('Invitation has expired or has already been used', 410);
  }

  static userNotFound(email: string): InvitationException {
    return new InvitationException(`No account found for email ${email}`, 404);
  }
}
