export class Cast {

  /**
   * undefined 初始化为任意类型
   */
  static get nil() {
    return (undefined as any);
  }

  /**
   * [] as any[]
   */
  static get anyA() {
    return [] as any[];
  }

  /**
   * Object() as any
   */
  static get anyO() {
    return this.as() as any;
  }

  /**
   * 指定对象转换为目标类型
   * @param [o] 对象
   * @return 目标类型
   */
  static as<T>(o = {}): T {
    return o as T;
  }

  /**
   * 包装为错误对象
   * @param err 错误消息或错误对象
   */
  static error(err?: string | Error): Error {
    if (err instanceof Error) {
      return err;
    } else if (typeof err === 'string') {
      return Error(err);
    } else {
      return Error('undefined');
    }
  }

  /**
   * 对象安全代理，防止出现在 undefined 目标上获取属性
   * @param o 目标对象
   * @param [dv] 目标对象为nil时代替目标对象成为被代理对象
   * @param [settable=true] 是否允许执行setter
   * @return 代理对象
   */
  static asSafety<T extends object>(
    o: T,
    dv = {},
    settable = true
  ): T {
    return new Proxy<T>(o ?? Cast.as(dv), {
      set(): boolean {
        return settable;
      }
    });
  }
}
