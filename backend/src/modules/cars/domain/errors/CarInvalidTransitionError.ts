export class CarInvalidTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CarInvalidTransitionError";
  }
}