import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getWeekYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime() + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const week = Math.floor(diff / oneWeek) + 1;
  return { week, year: now.getFullYear() };
};

export const getWeekDateRange = (year: number, week: number) => {
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  
  const week1Monday = new Date(year, 0, 4 - jan4Day + 1);
  
  const start = new Date(week1Monday.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return `${formatDate(start)} ~ ${formatDate(end)}`;
};

export const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, { ...options, headers });
  return response.json();
};
