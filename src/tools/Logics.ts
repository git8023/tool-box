import { Cast } from './Cast';
import { fns } from '../types/fns';
import { Validation } from './Validation';
import { Functions } from './Functions';

/**
 * 条件赋值逻辑
 */
class Switcher<T, I> {

  private valueInner?: T;

  constructor(
    private condition: boolean,
    value: fns.OrGetter<T, I>
  ) {
    this.setValue(condition, value);
  }

  /**
   * 如果上个条件为假且参数条件为真时，设置为当前值
   * @param condition 当前条件
   * @param value 值
   */
  case(
    condition: boolean,
    value: fns.OrGetter<T, I>
  ): Switcher<T, I> {
    if (this.condition) return this;
    this.setValue(condition, value);
    return this;
  }

  /**
   * 当所有条件都不满足时设置为参数值
   * @param value 默认值
   */
  otherwise(value: fns.OrGetter<T, I>): Switcher<T, I> {
    return this.setValue(!this.condition, value);
  }

  /**
   * 当参数条件为真时抛出异常
   * @param condition 当前条件
   * @param err 错误信息
   */
  throw(
    condition: boolean,
    err?: string | Error
  ): Switcher<T, I> {
    if (this.condition) return this;
    if (condition) throw Cast.error(err);
    return this;
  }

  /**
   * 不匹配任意case时抛出异常. 该函数调用时机应当在获取数据之前
   * @param err 错误信息
   * @see getValue
   */
  otherwiseThrow(err?: string | Error) {
    return this.throw(true, err);
  }

  /**
   * 当参数条件为真时设置值，否则抛出异常
   * @param condition 当前条件
   * @param value 值
   * @param err 错误信息
   */
  broken(
    condition: boolean,
    value: T,
    err?: string | Error
  ): Switcher<T, I> {
    if (!this.condition)
      throw Cast.error(err);
    return this.setValue(condition, value);
  }

  /**
   * 获取最终值
   */
  getValue(): T;

  /**
   * 获取最终值
   * @param handler 值处理器
   */
  getValue<R = T>(handler: fns.Handler<T, R>): R;

  getValue<R = T | void>(handler?: fns.Handler<T, R>): T | R {
    if (Validation.isNot(handler, 'Function')) return this.valueInner!;
    return handler!(this.valueInner!);
  }

  /**
   * 当前条件为真时设置指定值
   * @param condition 条件
   * @param value 指定值
   * @private
   */
  private setValue(
    condition?: boolean,
    value?: fns.OrGetter<T, I>
  ) {
    this.condition = condition ?? this.condition;
    if (this.condition)
      this.valueInner = Functions.execOrGetter(value);
    return this;
  }
}

export class Logics {

  /**
   * 构建条件赋值逻辑对象
   * @param condition 条件
   * @param value 值
   * @see Switcher
   */
  static case<R, T = unknown>(
    condition: boolean,
    value: fns.OrGetter<R, T>
  ): Switcher<R, T> {
    return new Switcher<R, T>(condition, value);
  }
}
