import { fns } from '../types/fns';
import { Validation } from './Validation';
import { Cast } from './Cast';
import { Promises } from './Promises';

export class Functions {

  /**
   * 调用函数
   * @param fn 函数引用，如果要指定上下文需要传递Lambda函数
   * @param [args] 请求参数
   * @return 函数返回值
   */
  static call<R, T = void>(
    fn?: fns.Handler<T, R>,
    ...args: any[]
  ): R | undefined {
    return (fn && Validation.isFunction(fn)) ? Cast.as<Function>(fn).call(undefined, ...args) : undefined;
  }

  /**
   * 执行数据获取函数
   * @param vog 数据或数据获取函数
   */
  static execOrGetter<T, I = void>(
    vog: fns.OrGetter<T, I>,
  ): T {
    return vog instanceof Function ? Functions.call<T, I>(vog)! : vog;
  }

  /**
   * 执行异步获取函数
   * @param oag 数据或同步/异步数据获取函数
   */
  static execOrAsyncGetter<T>(oag: fns.OrAsyncGetter<void, T>): Promise<T> {
    if (oag instanceof Promise)
      return oag as Promise<T>;

    const data = this.execOrGetter(oag as fns.OrGetter<T>);
    return Promises.from(data);
  }

  /**
   * 延迟执行
   * @param call 函数体
   * @param [loop=false] 是否持续执行
   * @param [lazy=0] 延迟时间(ms)
   * @param [immediate=false] 立即执行一次(异步)
   * @param [args=undefined] 执行参数
   */
  static timer(
    call: fns.Caller,
    loop = false,
    lazy = 0,
    immediate = false,
    ...args: any[]
  ) {
    if (immediate) {
      Functions.call(call, ...args);
      if (!loop)
        return;
    }

    setTimeout(() => {
      Promises.of(call).then(() => {
        loop && this.timer(call, loop, lazy);
      });
    }, lazy);
  }
}
