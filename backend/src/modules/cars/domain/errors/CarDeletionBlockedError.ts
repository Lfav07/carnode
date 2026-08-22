export class CarDeletionBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CarDeletionBlockedError";
  }
}
