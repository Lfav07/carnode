export class CarConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CarConflictError";
  }
}
