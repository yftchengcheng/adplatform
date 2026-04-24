import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 计算字符串的显示宽度（中文按2个字符，英文/符号按1个字符）
 * @param str 输入字符串
 * @returns 字符宽度
 */
export function getStringWidth(str: string | undefined | null): number {
  if (!str) return 0;
  let width = 0;
  for (const char of str) {
    // 判断是否是中文字符（包括中文标点）
    if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

/**
 * 截断字符串到指定宽度（中文按2个字符）
 * @param str 输入字符串
 * @param maxWidth 最大宽度
 * @returns 截断后的字符串
 */
export function truncateByWidth(str: string | undefined | null, maxWidth: number): string {
  if (!str) return '';
  let result = '';
  let width = 0;
  for (const char of str) {
    const charWidth = /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char) ? 2 : 1;
    if (width + charWidth > maxWidth) break;
    result += char;
    width += charWidth;
  }
  return result;
}

/**
 * 校验字符串是否超过指定宽度
 * @param str 输入字符串
 * @param maxWidth 最大宽度
 * @returns 是否超过
 */
export function isOverWidth(str: string | undefined | null, maxWidth: number): boolean {
  return getStringWidth(str) > maxWidth;
}
