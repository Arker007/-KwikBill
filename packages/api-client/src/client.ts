import {
  ApiError,
  ConflictError,
  NetworkError,
  NotFoundError,
  ServerError,
  TimeoutError,
  ValidationError,
} from './errors.ts';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined | null>;
}

const DEFAULT_TIMEOUT_MS = 15000;

function buildUrl(url: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return url;
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  if (!queryString) return url;
  return url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
}

/**
 * Standard HTTP API client wrapping native fetch with timeouts and structured errors.
 */
export class ApiClient {
  private defaultTimeoutMs: number;

  constructor(defaultTimeoutMs: number = DEFAULT_TIMEOUT_MS) {
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  async request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    const { body, timeoutMs = this.defaultTimeoutMs, params, headers, signal, ...rest } = options;
    const targetUrl = buildUrl(url, params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((headers as Record<string, string>) || {}),
    };

    let requestBody: string | FormData | Blob | ArrayBuffer | undefined;
    if (body !== undefined && body !== null) {
      if (typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof ArrayBuffer)) {
        requestBody = JSON.stringify(body);
      } else {
        requestBody = body;
        if (body instanceof FormData) {
          delete requestHeaders['Content-Type'];
        }
      }
    }

    let retries = 2;
    let currentDelayMs = 400;

    while (true) {
      try {
        const response = await fetch(targetUrl, {
          ...rest,
          headers: requestHeaders,
          body: requestBody,
          signal: controller.signal,
        });

        // Retry on 429 Too Many Requests
        if (response.status === 429 && retries > 0) {
          retries--;
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? Math.max(parseInt(retryAfter, 10) * 1000, 500) : currentDelayMs;
          currentDelayMs *= 2;
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        }

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorBody: any = null;
          try {
            errorBody = await response.json();
          } catch {
            /* non-JSON response */
          }

          const message = errorBody?.error || errorBody?.message || `API error (${response.status}): ${response.statusText}`;

          if (response.status === 400) {
            throw new ValidationError(message, errorBody);
          }
          if (response.status === 404) {
            throw new NotFoundError(message, errorBody);
          }
          if (response.status === 409) {
            throw new ConflictError(message, errorBody);
          }
          if (response.status >= 500) {
            throw new ServerError(message, response.status, errorBody);
          }
          throw new ApiError(message, response.status, 'ERR_HTTP', errorBody);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return (await response.json()) as T;
        }

        // If returned text/html on /api/* endpoint, retry if retries left
        if (retries > 0 && targetUrl.includes('/api/')) {
          retries--;
          await new Promise((r) => setTimeout(r, currentDelayMs));
          currentDelayMs *= 2;
          continue;
        }

        if (response.status === 204) {
          return null as T;
        }

        return (await response.text()) as unknown as T;
      } catch (err: any) {
        if (retries > 0 && !(err instanceof ApiError) && err.name !== 'AbortError') {
          retries--;
          await new Promise((r) => setTimeout(r, currentDelayMs));
          currentDelayMs *= 2;
          continue;
        }
        clearTimeout(timeoutId);
        if (err instanceof ApiError) {
          throw err;
        }
        if (err.name === 'AbortError') {
          throw new TimeoutError(`Request to ${targetUrl} timed out after ${timeoutMs}ms`);
        }
        throw new NetworkError(err.message || 'Failed to execute network request');
      }
    }
  }

  async get<T = any>(url: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  async put<T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  async delete<T = any>(url: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
