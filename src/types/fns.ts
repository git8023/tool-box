import { types } from './types';

export namespace fns {

  /**
   * 通用函数类型
   */
  export interface Function {
    (...args: any[]): any | undefined;
  }

  /**
   * 数据处理器
   */
  export interface Handler<T, R> {
    (data: T): R
  }

  /**
   * 数据消费处理器
   */
  export type Consume<T> = Handler<T, void>;

  /**
   * 可调用的函数
   */
  export type Caller = Consume<void>;

  /**
   * 数据获取处理器
   */
  export type Getter<R, T = void> = Handler<T, R>;

  /**
   * 数据或数据获取处理器
   */
  export type OrGetter<R, T = void> = R | Getter<R, T>;

  /**
   * 异步数据获取处理器
   */
  export type AsyncGetter<T, R = void> = Handler<T, Promise<R>>;

  /**
   * 异步数据或异步数据获取处理器
   */
  export type OrAsyncGetter<T, R> = OrGetter<R, T> | Promise<R> | AsyncGetter<T, Promise<R>>;

  /**
   * 对象映射处理器
   */
  export type KeyMapper<T, R = types.KeyType> = Handler<T, R>;

  /**
   * 对象属性或映射处理器
   */
  export type OrKeyMapper<T, R = types.KeyType> = types.KeyOf<T> | KeyMapper<T, R>;

  /**
   * 迭代映射处理器
   */
  export type IteratorMapper<T, R = types.KeyOf<T>> = Handler<types.IteratorItem<T>, R>;

  /**
   * 元素属性名或迭代映射处理器
   */
  export type OrIteratorMapper<T> = types.KeyOf<T> | IteratorMapper<T>;

  /**
   * 迭代处理器, 返回false终止
   */
  export type IteratorHandler<T, R = types.FalsyLike, K = string | number> = Getter<R, types.IteratorItem<T, K>>;

  /**
   * 数组迭代处理器, 返回false终止
   */
  export type ArrayIteratorHandler<T, R = types.FalsyLike> = IteratorHandler<T, R, number>;

  /**
   * 对象叠氮处理器, 返回false终止
   */
  export type ObjectIteratorHandler<T, R = types.FalsyLike> = IteratorHandler<T, R, string>;

  /**
   * 数组元素断言
   */
  export type ArrayPredictor<T> = types.KeyOf<T> | fns.ArrayIteratorHandler<T, boolean>;

  /**
   * 数组键映射器
   */
  export type ArrayKeyMapperHandler<T, R = string> = fns.ArrayIteratorHandler<T, R>;

  /**
   * 数组键映射器
   */
  export type ArrayKeyMapper<T, R = string> = types.KeyOf<T> | ArrayKeyMapperHandler<T, R>;
}
