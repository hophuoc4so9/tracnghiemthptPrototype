import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const cleanString = (str: string): string => {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/\n/g, '<br />').replace(/\s+/g, ' ').trim();
};