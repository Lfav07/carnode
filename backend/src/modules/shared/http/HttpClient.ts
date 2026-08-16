import type { HttpRequestOptions } from "./HttpRequestOptions.js";

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export interface HttpClient {
  get<T>(url: string, options?: HttpRequestOptions): Promise<T>;

  post<T>(
    url: string,
    body?: unknown,
    options?: HttpRequestOptions,
  ): Promise<T>;

  postWithResponse<T>(
    url: string,
    body?: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>>;

  put<T>(
    url: string,
    body?: unknown,
    options?: HttpRequestOptions,
  ): Promise<T>;

  delete<T>(
    url: string,
    options?: HttpRequestOptions,
  ): Promise<T>;
}