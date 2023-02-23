import { HttpException, HttpStatus } from '@nestjs/common';

export function tryCatchWrapper<T extends (...args: any) => Promise<any>>(
  cb: T,
) {
  return (...args: Parameters<T>): ReturnType<T> => {
    const params = args as any;
    return cb(...params).catch((error) => {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }) as any;
  };
}
