import type { HttpClient, HttpResponse } from "./HttpClient.js";
import type { HttpRequestOptions } from "./HttpRequestOptions.js";
import { HttpError } from "./HttpError.js";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export class FetchHttpClient implements HttpClient {
  async get<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>("GET", url, undefined, options);
  }

  async post<T>(
    url: string,
    body?: unknown,
    options?: HttpRequestOptions,
  ): Promise<T> {
    return this.request<T>("POST", url, body, options);
  }

  async postWithResponse<T>(
    url: string,
    body?: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.requestWithResponse<T>("POST", url, body, options);
  }

  async put<T>(
    url: string,
    body?: unknown,
    options?: HttpRequestOptions,
  ): Promise<T> {
    return this.request<T>("PUT", url, body, options);
  }

  async delete<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>("DELETE", url, undefined, options);
  }

  private async request<T>(
    method: HttpMethod,
    url: string,
    body?: unknown,
    options?: HttpRequestOptions,
  ): Promise<T> {
    const response = await this.requestWithResponse<T>(
      method,
      url,
      body,
      options,
    );

    return response.data;
  }

  private async requestWithResponse<T>(
    method: HttpMethod,
    url: string,
    body?: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    const fullUrl = this.buildUrl(url, options?.queryParams);

    const headers: Record<string, string> = {
      ...options?.headers,
    };

    if (body !== undefined && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const controller = new AbortController();
    const signal = controller.signal;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (options?.timeout !== undefined) {
      timeoutId = setTimeout(() => controller.abort(), options.timeout);
    }

    const init: RequestInit = {
      method,
      headers,
      signal,
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(fullUrl, init);

      if (!response.ok) {
        const responseBody = await this.parseResponseBody(response);

        throw new HttpError(
          response.status,
          response.statusText,
          responseBody,
        );
      }

      const data = await this.parseResponseBody<T>(response);

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  }

  private async parseResponseBody<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  }

  private buildUrl(
    baseUrl: string,
    queryParams?: Record<string, string>,
  ): string {
    if (!queryParams || Object.keys(queryParams).length === 0) {
      return baseUrl;
    }

    const url = new URL(baseUrl);

    for (const [key, value] of Object.entries(queryParams)) {
      url.searchParams.append(key, value);
    }

    return url.toString();
  }
}