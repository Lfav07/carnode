export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body?: unknown,
  ) {
    super(`HTTP ${status}: ${statusText}`);

    this.name = "HttpError";
  }
}