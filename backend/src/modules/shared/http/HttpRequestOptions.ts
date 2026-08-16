export interface HttpRequestOptions {
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  timeout?: number;
}