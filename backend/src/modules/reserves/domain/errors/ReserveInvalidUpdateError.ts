import { DomainError } from "../../../shared/errors/DomainError.js";

export class ReserveInvalidUpdateError extends DomainError {
  readonly httpStatusCode = 400;

  constructor(message: string) {
    super(message);
  }
}
