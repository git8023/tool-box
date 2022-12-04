import { Validation } from './Validation';

export class BError extends Error {
  constructor(e: string | Error) {
    const msg = BError.isError(e) ? (e as Error).message : (e as string);
    super(msg);
    this.name = 'BError';
  }


  /**
   * 包装为错误对象
   * @param e 错误信息或错误对象
   */
  static from(e: any): Error {
    return this.isError(e) ? e : new BError(e);
  }

  /**
   * 判断一个对象是否为Error实例
   * @param e 目标对象
   */
  static isError(e: any) {
    return Validation.is(e, 'Error');
  }

  /**
   * 如果条件为false, 抛出异常
   * @param c 条件
   * @param [msg] 错误消息
   * @throws 条件为假时
   */
  static readonly iff = (
    c: boolean,
    msg: string
  ) => {
    if (!c) this.throwError(msg);
  };

  /**
   * 抛出异常
   * @param [e] 错误消息或错误对象
   */
  static readonly throwError = (e?: string | Error) => {
    throw this.from(e);
  };
}
