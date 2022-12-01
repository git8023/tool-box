import { types } from '../types/types';
import { fns } from '../types/fns';
import { Cast } from './Cast';
import { Logs } from './Logs';
import { Validation } from './Validation';
import { Functions } from './Functions';


export class Promises {

  /**
   * 数据包装为异步
   * @param data 目标数据
   */
  static from<T>(data: T): Promise<T> {
    return Promise.resolve(data);
  }

  /**
   * 包装数据或数据获取器
   * @param og 数据或数据获取器
   */
  static of<R, T = void>(og: fns.OrAsyncGetter<T, R>): Promise<R> {
    if (Validation.isFunction(og))
      return new Promise((
        resolve,
        reject
      ) => {
        try {
          const data = Functions.call(og as fns.Getter<R>);
          resolve(data!);
        } catch (e) {
          reject(e);
        }
      });
    return this.from(og as R);
  }

  /**
   * 增强原生Promise功能
   * @param src 原始Promise
   */
  static control<T = void>(src: Promise<T>): types.PromiseControl<T> {
    const control: { abort: fns.Caller } = Cast.as();
    const promise: types.PromiseControl<T> = Promise.race([
      src || Promise.resolve<T>(undefined as any),
      new Promise((
        resolve,
        reject
      ) => {
        control.abort = reject;
      }).catch(() => Logs.debug('异步数据被取消!'))
    ]) as any;
    promise.abort = () => control.abort();

    return promise;
  }

}
