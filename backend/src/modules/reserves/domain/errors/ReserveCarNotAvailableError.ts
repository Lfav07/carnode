export class ReserveCarNotAvailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReserveCarNotAvailableError";
  }
}
