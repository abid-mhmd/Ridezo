const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data: unknown = await response.json();

      if (
        typeof data !== 'object' ||
        data === null ||
        !('accessToken' in data) ||
        typeof data.accessToken !== 'string'
      ) {
        return null;
      }

      accessToken = data.accessToken;
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function restoreSession(): Promise<string | null> {
  return refreshAccessToken();
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const makeRequest = (token: string | null) => {
    const headers = new Headers(options.headers);

    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      headers.delete('Authorization');
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  };

  let response = await makeRequest(accessToken);

  if (response.status === 401 && !endpoint.startsWith('/auth/')) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      response = await makeRequest(newToken);
    } else {
      accessToken = null;
    }
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? data.message
        : 'Something went wrong. Please try again.';

    throw new Error(
      Array.isArray(message) ? message.join(', ') : String(message),
    );
  }

  return data as T;
}
