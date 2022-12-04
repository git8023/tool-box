import { Logs } from '../tools/Logs';
import { fns } from '../types/fns';
import { Decorators } from './decorators';

export class Observer {

  /**
   * 记录日志
   * @param [params=true] 打印请求参数
   * @param [returns=false] 打印返回值
   */
  static log(
    params = true,
    returns = true
  ) {
    return (
      target: any,
      fnKey: string
    ) => {

      const prefix = `[${fnKey}] `;
      const fn = target[fnKey];
      target[fnKey] = (...args: any[]) => {
        if (params)
          Logs.debug(prefix, ' Parameters: ', args);

        const data = fn(...args);
        if (returns)
          Logs.debug(prefix, ' Returns: ', data);

        return data;
      };

    };
  }


  /**
   * 延迟执行直到断言成功
   * @param predicate 断言函数
   * @param [lazy=10] 首次执行延迟时间(ms)
   * @param [interval=10] 第N+1次断言间隔时间(ms)
   */
  static lazy = <T>(
    predicate: fns.HandlerPs<boolean, T>,
    lazy = 10,
    interval?: number
  ) => {

    lazy = (0 < lazy) ? lazy : 10;
    interval = interval ?? lazy;
    interval = (0 <= interval) ? interval : lazy;

    return Decorators.method(({ target, fnKey }) => {
      const fn = target[fnKey];
      target[fnKey] = function (...args: any[]) {
        const thisInner = this;
        const fnWrapper = (): boolean => {
          // const result = !!Functions.call(predicate, thisInner);
          const result = predicate.bind(thisInner)(thisInner, ...args);
          result && fn.bind(thisInner)(...args);
          return result;
        };

        setTimeout(() => {
          fnWrapper();
          const intervalId = setInterval(() => fnWrapper() && clearInterval(intervalId), interval);
        }, lazy);
      };
    });
  };


  static x = (
    target: any,
    fnKey: string
  ) => {
    debugger;
    target.___c___ = 'xxx';
    const fn = target[fnKey];
    target[fnKey] = function (...args: any[]) {
      debugger;
      fn.bind(target)(1,2,3);
    };
  };

}
