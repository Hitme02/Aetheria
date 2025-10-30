export const API_BASE = import.meta.env.VITE_API_BASE || '';
export const API_AUTH_BASE = import.meta.env.VITE_API_AUTH_BASE || API_BASE;
export const API_UPLOAD_BASE = import.meta.env.VITE_API_UPLOAD_BASE || API_BASE;
export const API_METADATA_BASE = import.meta.env.VITE_API_METADATA_BASE || API_BASE;
export const API_MINT_BASE = import.meta.env.VITE_API_MINT_BASE || API_BASE;
export const API_VOTING_BASE = import.meta.env.VITE_API_VOTING_BASE || API_BASE;

function getToken() {
  try {
    return localStorage.getItem('aetheria_token');
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit, base: string = API_BASE): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers || {})
  };
  const token = getToken();
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiUpload<T>(path: string, formData: FormData, init?: RequestInit, base: string = API_UPLOAD_BASE) {
  const headers: HeadersInit = { ...(init?.headers || {}) };
  const token = getToken();
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const res = await fetch(url, { method: 'POST', body: formData, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Upload failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const authGet = <T>(p: string, init?: RequestInit) => apiFetch<T>(p, init, API_AUTH_BASE);
export const authPost = <T>(p: string, body: any, init?: RequestInit) => apiFetch<T>(p, { method: 'POST', body: JSON.stringify(body), ...(init||{}) }, API_AUTH_BASE);
export const votingPost = <T>(p: string, body: any, init?: RequestInit) => apiFetch<T>(p, { method: 'POST', body: JSON.stringify(body), ...(init||{}) }, API_VOTING_BASE);
export const votingGet = <T>(p: string, init?: RequestInit) => apiFetch<T>(p, init, API_VOTING_BASE);
export const mintPost = <T>(p: string, body: any, init?: RequestInit) => apiFetch<T>(p, { method: 'POST', body: JSON.stringify(body), ...(init||{}) }, API_MINT_BASE);
