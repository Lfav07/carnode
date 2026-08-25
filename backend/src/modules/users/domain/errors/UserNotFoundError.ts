import { DomainError } from "../../../shared/errors/DomainError.js";

export class UserNotFoundError extends DomainError {
  readonly httpStatusCode = 404;

  constructor(message: string) {
    super(message);
  }
}
