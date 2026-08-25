import { DomainError } from "../../../shared/errors/DomainError.js";

export class UserConflictError extends DomainError {
  readonly httpStatusCode = 409;

  constructor(message: string) {
    super(message);
  }
}
