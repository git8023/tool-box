export default class Cast {

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
   * {} as any
   */
  static get anyO() {
    return this.as() as any;
  }

  /**
   * 指定对象转换为目标类型
   * @param [o={}] 对象
   * @return 目标类型
   */
  static as<T>(o: any = {}): T {
    return o as T;
  }

  /**
   * 包装为错误对象
   * @param err 错误消息或错误对象
   */
  static error(err?: string | Error): Error {
    if (err instanceof Error) return err;
    else if (typeof err === 'string') return Error(err);
    else return Error('undefined');
  }
}
