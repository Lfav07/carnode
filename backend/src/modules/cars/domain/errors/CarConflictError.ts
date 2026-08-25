import { DomainError } from "../../../shared/errors/DomainError.js";

export class CarConflictError extends DomainError {
  readonly httpStatusCode = 409;

  constructor(message: string) {
    super(message);
  }
}
