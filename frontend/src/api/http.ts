const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

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
