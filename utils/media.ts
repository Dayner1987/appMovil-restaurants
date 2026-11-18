// utils/media.ts
import { api } from '@/services/api';

/** Strapi may return a relative /uploads path, Cloudinary URL or legacy attributes. */
export function mediaUrl(input: unknown): string | null {
  if (!input) return null;
  const item: any = typeof input === 'string' ? {url: input} : input;
  const source = item?.data?.attributes ?? item?.data ?? item?.attributes ?? item;
  const url = source?.formats?.small?.url ?? source?.url;
  if (typeof url !== 'string' || !url.trim()) return null;
  const value = url.trim();
  if (/^https?:\/\//i.test(value) || value.startsWith('data:') || value.startsWith('file:')) return value;
  if (value.startsWith('//')) return `https:${value}`;
  const base = String(api.defaults.baseURL ?? '').replace(/\/+$/, '');
  if (!base) return null;
  return `${base}/${value.replace(/^\/+/, '')}`;
}
