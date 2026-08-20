export class CarRentedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CarRentedError";
  }
}