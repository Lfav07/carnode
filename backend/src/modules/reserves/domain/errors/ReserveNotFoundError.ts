import { DomainError } from "../../../shared/errors/DomainError.js";

export class ReserveNotFoundError extends DomainError {
  readonly httpStatusCode = 404;

  constructor(message: string) {
    super(message);
  }
}
