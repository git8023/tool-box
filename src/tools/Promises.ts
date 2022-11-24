import { types } from '../types/types';
import { fns } from '../types/fns';
import { Cast } from '../tools/Cast';
import { Logs } from './Logs';


export class Promises {

  /**
   * 数据包装为异步
   * @param data 目标数据
   */
  static from<T>(data: T): Promise<T> {
    return Promise.resolve(data);
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
