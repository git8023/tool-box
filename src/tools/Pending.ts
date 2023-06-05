import { fns } from '../types/fns';
import { Cast } from './Cast';
import { Functions } from './Functions';

/** 挂起等待条件完成后执行 */
export class Pending<T extends string> {

  private readonly awaits: Record<T, fns.Caller> = Cast.anyO;

  constructor(private asyncCall: fns.Consume<any>, private conditions: T[]) {
    this.init();
  }

  /**
   * 创建实例
   * @param asyncCall 挂起结束回调
   * @param conditions 条件设定(重复条件只保留一个)
   */
  static create<C extends string>(asyncCall: fns.Caller, ...conditions: C[]): Pending<C> {
    return new Pending<C>(asyncCall, conditions ?? []);
  }

  /**
   * 完成指定条件
   * @param cKey 条件关键字
   */
  complete(cKey: T): Pending<T> {
    Functions.call(this.awaits[cKey]);
    return this;
  }

  /**
   * 初始化
   * @example
   * await
   *    .all:
   *        each Promise(c)
   *    .then:
   *        call asyncCall
   * @private
   */
  private init() {
    const awaits: Promise<void>[] = [];
    this.conditions.forEach((c) => {
      awaits.push(new Promise((resolve) => {
        this.awaits[c] = resolve;
      }));
    });

    Promise.all(awaits).then(this.asyncCall);
  }
}
