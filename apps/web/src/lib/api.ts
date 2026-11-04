export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}
