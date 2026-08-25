export class ReserveInvalidUpdateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReserveInvalidUpdateError";
  }
}
