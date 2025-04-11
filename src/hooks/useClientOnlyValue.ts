import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Sử dụng giá trị khác nhau cho web và native
 * @param webValue Giá trị được sử dụng cho web
 * @param nativeValue Giá trị được sử dụng cho native
 * @returns Giá trị phù hợp với nền tảng
 */
export function useClientOnlyValue<T>(webValue: T, nativeValue: T): T {
  // Trả về ngay lập tức giá trị native nếu không phải web
  if (Platform.OS !== 'web') {
    return nativeValue;
  }

  // Giá trị state cho web
  const [value, setValue] = useState<T>(webValue);

  useEffect(() => {
    // Trong effect, sử dụng giá trị native
    setValue(nativeValue);
  }, [nativeValue]);

  return value;
} 