export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationRequestData{
 page: number,
 limit: number
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestConfig extends Omit<RequestInit, "method" | "body"> {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  timeout?: number;
}

export interface RequestInterceptor {
  onFulfilled: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onRejected?: (error: unknown) => never | Promise<never>;
}

export interface ResponseInterceptor {
  onFulfilled: (response: Response) => Response | Promise<Response>;
  onRejected?: (error: unknown) => never | Promise<never>;
}

export interface Interceptors {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
}
