import { types } from '../types/types';
import { fns } from '../types/fns';
import { Objects } from './Objects';
import { Jsons } from './Jsons';
import { Validation } from './Validation';
import { Logics } from './Logics';
import { Functions } from './Functions';
import { Cast } from './Cast';

export class Builders {

  /**
   * 构建返回参数值的函数
   * @example
   *
   * Builders.getterSelf(1);  // () => 1
   * Builders.getterSelf();   // (param) => param
   *
   * @param [returnValue] 返回值, 默认返回第一个参数
   * @return returnValue ?? param
   */
  static getterSelf<T, R = any>(returnValue?: R): T {
    return ((param:any) => returnValue ?? param) as T;
  }

  /**
   * 构建单个参数提取指定属性值的函数
   * @param key 属性名
   * @return (bean: I) => bean[key]
   */
  static getter<T, I = any>(key: keyof I): T {
    return ((bean: I) => Jsons.get(bean, key.toString())) as T;
  }

  /**
   * 构建迭代器元素属性值获取函数
   * @param [key=undefined] 元素属性名
   * @return key ? (e=>e[key]) : (e=>e)
   */
  static iteratorGetter<T, I extends types.IteratorItem<E>, E = any>(key?: keyof E): T {
    const fn = (e: I) => {
      if (Validation.notEmpty(key))
        return Jsons.get(e.item, key!.toString());
      return e.item;
    };
    return fn as T;
  }

  /**
   * 构建判断两个对象是否相等的函数, 其中一个对象来自返回函数第一个参数
   * @param target 匹配源对象
   * @param [prop] 匹配特定值, 如果没有指定则比较引用是否同一个
   */
  static equalsOther<T>(
    target: T,
    prop?: types.KeyOf<T>
  ): fns.Handler<T, boolean> {
    return (input: T) => Objects.equals(input, target, prop);
  }

  /**
   * 构建判断两个对象是否相等的函数, 其中返回函数的参数是一个迭代元素对象
   * @param target 匹配源对象
   * @param [predictor=(el=>el===target)] 断言属性或断言函数
   */
  static equalsOtherElement<T>(
    target: T,
    predictor?: fns.ArrayPredictor<T>
  ): fns.Handler<types.IteratorItem<T>, boolean> {
    return (input) => {
      if (input.item === target)
        return true;

      if (typeof predictor === 'string')
        return Objects.equals(input.item, target, predictor as string);

      if (Validation.isFunction(predictor)) {
        const r = Functions.call(predictor as fns.ArrayIteratorHandler<T, boolean>, input, target);
        return !!r;
      }

      return false;
    };
  }

  /**
   * 对象映射键
   * @param key 对象映射键或自定义返回对象映射键
   */
  static iteratorMapper<T>(key: fns.OrIteratorMapper<T>): fns.IteratorMapper<T> {
    const isSingleKey = Validation.isOr(key, 'String', 'Number');
    if (isSingleKey) return Builders.iteratorGetter(key as keyof T);
    return key as fns.IteratorMapper<T>;
  }

  /**
   * 转换为数组键映射器
   * @param [akm=undefined] 数组元素属性名或数组键映射器
   * @param [mod='throw'] 当akm未定义时处理方式
   */
  static toArrayKeyMapperHandler<T, R = any>(
    akm?: fns.ArrayKeyMapper<T, R>,
    mod: 'throw' | 'element' = 'throw'
  ): fns.ArrayKeyMapperHandler<T, R> {
    return Logics
      .case(akm instanceof Function, () => akm as fns.ArrayKeyMapperHandler<T, R>)
      .case(Validation.is(akm, 'String'), () => Builders.iteratorGetter(akm as string) as R)
      .case(mod === 'element', () => Builders.iteratorGetter() as R)
      .otherwiseThrow(Error('predictor无效. 仅支持String|Function'))
      .getValue();
  }

  /**
   * 构建具有固定参数的调用函数
   * @param fn 函数引用
   * @param [args] 参数
   */
  static runner<T>(
    fn: fns.Function,
    ...args: any[]
  ): T {
    return Cast.as(() => fn(...args));
  }
}
