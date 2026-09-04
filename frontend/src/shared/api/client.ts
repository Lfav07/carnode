import { ApiError } from "./ApiError";
import type {
  Interceptors,
  PaginatedResponse,
  RequestConfig,
} from "./types";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildUrl(
  base: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(normalizedPath, normalizedBase);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value != null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

function serializeBody(body: unknown): string | FormData | undefined {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

/* ------------------------------------------------------------------ */
/*  Client                                                             */
/* ------------------------------------------------------------------ */

export interface ApiClientConfig {
  baseUrl: string;
  interceptors?: Partial<Interceptors>;
}

export function createApiClient(config: ApiClientConfig) {
  const interceptors: Interceptors = {
    request: config.interceptors?.request ?? [],
    response: config.interceptors?.response ?? [],
  };

  async function request<T>(
    path: string,
    options: RequestConfig = {},
  ): Promise<T> {
    const { params, timeout, headers: customHeaders, ...init } = options;

    let requestConfig: RequestConfig = {
      ...init,
      params,
      timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...customHeaders,
      },
    };

    // Run request interceptors
    for (const interceptor of interceptors.request) {
      requestConfig = await interceptor.onFulfilled(requestConfig);
    }

    const { params: finalParams, timeout: finalTimeout, body, headers, ...fetchInit } =
      requestConfig;

    const url = buildUrl(config.baseUrl, path, finalParams);

    const controller = new AbortController();
    const id = finalTimeout
      ? setTimeout(() => controller.abort(), finalTimeout)
      : undefined;

    try {
      const response = await fetch(url, {
        ...fetchInit,
        body: serializeBody(body),
        headers,
        signal: controller.signal,
      });

      // Run response interceptors
      let finalResponse = response;
      for (const interceptor of interceptors.response) {
        finalResponse = await interceptor.onFulfilled(finalResponse);
      }

      // Handle no-content responses
      if (finalResponse.status === 204) {
        return undefined as T;
      }

      const data = await finalResponse.json();

      if (!finalResponse.ok) {
        throw new ApiError(finalResponse.status, data);
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError(408, { message: "Request timed out" });
      }

      throw new ApiError(0, {
        message: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      if (id) clearTimeout(id);
    }
  }

  function get<T>(path: string, config?: Omit<RequestConfig, "body" | "method">) {
    return request<T>(path, { ...config, method: "GET" });
  }

  function post<T>(path: string, body?: unknown, config?: Omit<RequestConfig, "body" | "method">) {
    return request<T>(path, { ...config, method: "POST", body });
  }

  function put<T>(path: string, body?: unknown, config?: Omit<RequestConfig, "body" | "method">) {
    return request<T>(path, { ...config, method: "PUT", body });
  }

  function patch<T>(path: string, body?: unknown, config?: Omit<RequestConfig, "body" | "method">) {
    return request<T>(path, { ...config, method: "PATCH", body });
  }

  function del<T>(path: string, config?: Omit<RequestConfig, "body" | "method">) {
    return request<T>(path, { ...config, method: "DELETE" });
  }

  function paginated<T>(path: string, config?: Omit<RequestConfig, "body" | "method">) {
    return get<PaginatedResponse<T>>(path, config);
  }

  return {
    request,
    get,
    post,
    put,
    patch,
    del,
    paginated,
    interceptors,
  };
}
