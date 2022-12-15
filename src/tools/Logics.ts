import { Cast } from './Cast';
import { fns } from '../types/fns';
import { Validation } from './Validation';
import { Functions } from './Functions';

/**
 * 条件赋值逻辑
 */
export class Switcher<T, I> {

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

/**
 * 条件记录器
 */
export class Condition<ND, PD> {

  private negativeDesc!: ND;
  private positiveDesc!: PD;

  constructor(private c = true) {
  }

  //<editor-fold desc="and">
  // @formatter:off
  and(c:boolean, positiveDesc:PD, negativeDesc:ND):Condition<ND, PD>;
  and(c:boolean, positiveDesc:PD, negativeDesc:ND, effect:boolean):Condition<ND, PD>;
  and(c:boolean, positiveDesc:PD, negativeDesc:ND, effect:boolean, returns:'CHAIN'):Condition<ND, PD>;
  and(c:boolean, positiveDesc:PD, negativeDesc:ND, effect:boolean, returns:'PARAMETER'):boolean;
  and(c:boolean, positiveDesc:PD, negativeDesc:ND, effect:boolean, returns:'CONDITION'):boolean;
  // @formatter:on
  //</editor-fold>

  /**
   * 逻辑与
   * @param c 参考条件
   * @param positiveDesc 正面描述数据
   * @param negativeDesc 负面描述数据
   * @param effect 运算结果是否影响当前条件
   * @param returns 返回值类型
   */
  and(
    c: boolean,
    positiveDesc: PD,
    negativeDesc: ND,
    effect = true,
    returns: 'PARAMETER' | 'CONDITION' | 'CHAIN' = 'CHAIN'
  ): boolean | Condition<ND, PD> {
    return this.exec(this.c && c, positiveDesc, negativeDesc, effect, returns, c);
  }

  //<editor-fold desc="or">
  // @formatter:off
  or(c:boolean, positiveDesc:PD, negativeDesc:ND):Condition<ND, PD>;
  or(c:boolean, positiveDesc:PD, negativeDesc:ND, effect:boolean):Condition<ND, PD>;
  or(c:boolean, positiveDesc:PD, negativeDesc:ND, effect:boolean, returns:'CHAIN'):Condition<ND, PD>;
  or(c:boolean, positiveDesc:PD, negativeDesc:ND, effect:boolean, returns:'PARAMETER'):boolean;
  or(c:boolean, positiveDesc:PD, negativeDesc:ND, effect:boolean, returns:'CONDITION'):boolean;
  // @formatter:on
  //</editor-fold>

  /**
   * 逻辑或
   * @param c 参考条件
   * @param positiveDesc 正面描述数据
   * @param negativeDesc 负面描述数据
   * @param effect 运算结果是否影响当前条件
   * @param returns 返回值类型
   */
  or(
    c: boolean,
    positiveDesc: PD,
    negativeDesc: ND,
    effect = true,
    returns: 'PARAMETER' | 'CONDITION' | 'CHAIN' = 'CHAIN'
  ): boolean | Condition<ND, PD> {
    return this.exec(this.c || c, positiveDesc, negativeDesc, effect, returns, c);
  }

  //<editor-fold desc="not">
  // @formatter:off
  not(positiveDesc:PD, negativeDesc:ND):Condition<ND, PD>;
  not(positiveDesc:PD, negativeDesc:ND, effect:boolean):Condition<ND, PD>;
  not(positiveDesc:PD, negativeDesc:ND, effect:boolean, returns:'CHAIN'):Condition<ND, PD>;
  not(positiveDesc:PD, negativeDesc:ND, effect:boolean, returns:'PARAMETER'):boolean;
  not(positiveDesc:PD, negativeDesc:ND, effect:boolean, returns:'CONDITION'):boolean;
  // @formatter:on
  //</editor-fold>

  /**
   * 逻辑非
   * @param value 值
   * @param effect 运算结果是否影响当前条件
   * @param returns 返回值类型
   */
  not(
    positiveDesc: PD,
    negativeDesc: ND,
    effect = true,
    returns: 'PARAMETER' | 'CONDITION' | 'CHAIN' = 'CHAIN'
  ): boolean | Condition<ND, PD> {
    return this.exec(!this.c, positiveDesc, negativeDesc, effect, returns);
  }

  /**
   * 处理运算结果
   * @param handler 处理器
   * @return 处理器执行结果
   */
  result<R>(handler: fns.HandlerT9<R, boolean, PD, ND>): R {
    return Functions.call(handler, this.c, this.positiveDesc, this.negativeDesc)!;
  }

  /**
   * 执行处理
   * @param rc 参考条件
   * @param value 值
   * @param effect 运算结果是否影响当前条件
   * @param returns 返回值类型
   * @param [paramCondition] 参数中的条件, 未指定时返回当前条件
   * @private
   */
  private exec(
    rc: boolean,
    positiveDesc: PD,
    negativeDesc: ND,
    effect: boolean,
    returns: 'PARAMETER' | 'CONDITION' | 'CHAIN',
    paramCondition?: boolean
  ) {
    if (rc) {
      this.positiveDesc = positiveDesc;
    } else {
      this.negativeDesc = negativeDesc;
    }

    this.c = effect ? rc : this.c;

    switch (returns) {
      case 'PARAMETER':
        return paramCondition ?? this.c;
      case 'CONDITION':
        return this.c;
      case 'CHAIN':
        return this;
      default:
        return this;
    }
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

  /**
   * 条件记录器
   * @param [c=true] 默认条件
   */
  static condition<PD = string, ND = string>(c = true): Condition<PD, ND> {
    return new Condition<PD, ND>(c);
  }
}

