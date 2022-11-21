import { fns } from '@/types/fns';
import { Validation } from '@/tools/Validation';
import { Cast } from '@/tools/Cast';
import { Promises } from '@/tools/Promises';

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

}
