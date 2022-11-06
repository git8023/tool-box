import { fns } from '@/types/fns';
import Validation from '@/tools/Validation';
import Cast from '@/tools/Cast';

export default class Functions {

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
    return (fn && Validation.isFunction(fn)) ? Cast.as<Function>(fn).call(undefined, args) : undefined;
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
}
