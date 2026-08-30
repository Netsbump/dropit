export abstract class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
