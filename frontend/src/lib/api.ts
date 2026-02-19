/**
 * API クライアント - バズ動画リサーチくん
 *
 * 認証ヘッダー付きのAPI呼び出しを提供
 */

import { getAccessToken } from './supabase';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8433').trim().replace(/\s/g, '');

export interface ApiError {
  detail: string;
  status: number;
}

export class ApiClientError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiClientError';
    this.status = status;
    this.detail = detail;
  }
}

/**
 * 認証付きfetch
 */
async function authFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

/**
 * GETリクエスト
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await authFetch(endpoint, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'エラーが発生しました' }));
    throw new ApiClientError(response.status, error.detail);
  }

  return response.json();
}

/**
 * POSTリクエスト
 */
export async function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await authFetch(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'エラーが発生しました' }));
    throw new ApiClientError(response.status, error.detail);
  }

  return response.json();
}

/**
 * PUTリクエスト
 */
export async function apiPut<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await authFetch(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'エラーが発生しました' }));
    throw new ApiClientError(response.status, error.detail);
  }

  return response.json();
}

/**
 * DELETEリクエスト
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await authFetch(endpoint, { method: 'DELETE' });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'エラーが発生しました' }));
    throw new ApiClientError(response.status, error.detail);
  }

  return response.json();
}

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};
