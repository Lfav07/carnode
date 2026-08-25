import { DomainError } from "../../../shared/errors/DomainError.js";

export class CarInvalidTransitionError extends DomainError {
  readonly httpStatusCode = 400;

  constructor(message: string) {
    super(message);
  }
}
