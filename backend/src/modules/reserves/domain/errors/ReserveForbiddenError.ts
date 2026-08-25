import { DomainError } from "../../../shared/errors/DomainError.js";

export class ReserveForbiddenError extends DomainError {
  readonly httpStatusCode = 403;

  constructor(message: string) {
    super(message);
  }
}
