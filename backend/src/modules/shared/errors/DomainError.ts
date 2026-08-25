export abstract class DomainError extends Error {
  abstract readonly httpStatusCode: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
