import { fns } from '../types/fns';
import { types } from '../types/types';


/**
 * 装饰器工具类
 */
export class Decorators {

  /**
   * 生成类(class)装饰
   * @param call 装饰器逻辑
   */
  static readonly class = <T = Function>(call: fns.Consume<types.DecoratorClassParameter<T>>) => (target: T) => call({ target });

  /**
   * 生成函数(Function)装饰器
   * @param call 装饰器逻辑
   */
  static readonly method = <T = any>(call: fns.Consume<types.DecoratorMethodParameter<T>>) => (
    target: T,
    fnKey: string
  ) => call({ target, fnKey });

  /**
   * 代理
   * @param call 属性代理逻辑
   */
  static readonly proxy = (call: fns.HandlerT9<any, any, types.DecoratorProxyMethodParameter, any[]>) => {
    return Decorators.method(({ target, fnKey }) => {
      const vof = target[fnKey];
      target[fnKey] = function (...args: any[]) {
        return call(this, { target, key: fnKey, vof }, args);
      };
    });
  };

}
