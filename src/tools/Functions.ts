import { fns } from '@/types/fns';
import Validation from '@/tools/Validation';
import Logics from '@/tools/Logics';
import Cast from '@/tools/Cast';
import Builders from '@/tools/Builders';

export default class Functions {

  /**
   * 调用函数
   * @param fn 函数引用，如果要指定上下文需要传递Lambda函数
   * @param [args] 请求参数
   * @return 函数返回值
   */
  static call<R>(
    fn?: fns.Handler<void, R>,
    ...args: any[]
  ): R | undefined {
    return (fn && Validation.isFunction(fn)) ? fn.call(undefined, ...args) : undefined;
  }

  /**
   * 执行数据获取函数
   * @param vog 数据或数据获取函数
   * @param [args=void] 函数执行参数
   */
  static execOrGetter<T, I = void>(
    vog: fns.OrGetter<T, I>,
    ...args: any[]
  ): T {
    const isFun = Validation.isFunction(vog);
    return Logics.case<T>(isFun, Builders.runner(vog as fns.Getter<T>, ...args)).otherwise(Cast.as<T>(vog)).get();
  }
}
