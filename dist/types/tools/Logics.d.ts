import { fns } from '../types/fns';
/**
 * 条件赋值逻辑
 */
export declare class Switcher<T, I> {
    private condition;
    private valueInner?;
    constructor(condition: boolean, value: fns.OrGetter<T, I>);
    /**
     * 如果上个条件为假且参数条件为真时，设置为当前值
     * @param condition 当前条件
     * @param value 值
     */
    case(condition: boolean, value: fns.OrGetter<T, I>): Switcher<T, I>;
    /**
     * 当所有条件都不满足时设置为参数值
     * @param value 默认值
     */
    otherwise(value: fns.OrGetter<T, I>): Switcher<T, I>;
    /**
     * 当参数条件为真时抛出异常
     * @param condition 当前条件
     * @param err 错误信息
     */
    throw(condition: boolean, err?: string | Error): Switcher<T, I>;
    /**
     * 不匹配任意case时抛出异常. 该函数调用时机应当在获取数据之前
     * @param err 错误信息
     * @see getValue
     */
    otherwiseThrow(err?: string | Error): Switcher<T, I>;
    /**
     * 当参数条件为真时设置值，否则抛出异常
     * @param condition 当前条件
     * @param value 值
     * @param err 错误信息
     */
    broken(condition: boolean, value: T, err?: string | Error): Switcher<T, I>;
    /**
     * 获取最终值
     */
    getValue(): T;
    /**
     * 获取最终值
     * @param handler 值处理器
     */
    getValue<R = T>(handler: fns.Handler<T, R>): R;
    /**
     * 当前条件为真时设置指定值
     * @param condition 条件
     * @param value 指定值
     * @private
     */
    private setValue;
}
/**
 * 条件记录器
 */
export declare class Condition<ND, PD> {
    private c;
    private negativeDesc;
    private positiveDesc;
    constructor(c?: boolean);
    and(c: boolean, positiveDesc: PD, negativeDesc: ND): Condition<ND, PD>;
    and(c: boolean, positiveDesc: PD, negativeDesc: ND, effect: boolean): Condition<ND, PD>;
    and(c: boolean, positiveDesc: PD, negativeDesc: ND, effect: boolean, returns: 'CHAIN'): Condition<ND, PD>;
    and(c: boolean, positiveDesc: PD, negativeDesc: ND, effect: boolean, returns: 'PARAMETER'): boolean;
    and(c: boolean, positiveDesc: PD, negativeDesc: ND, effect: boolean, returns: 'CONDITION'): boolean;
    or(c: boolean, positiveDesc: PD, negativeDesc: ND): Condition<ND, PD>;
    or(c: boolean, positiveDesc: PD, negativeDesc: ND, effect: boolean): Condition<ND, PD>;
    or(c: boolean, positiveDesc: PD, negativeDesc: ND, effect: boolean, returns: 'CHAIN'): Condition<ND, PD>;
    or(c: boolean, positiveDesc: PD, negativeDesc: ND, effect: boolean, returns: 'PARAMETER'): boolean;
    or(c: boolean, positiveDesc: PD, negativeDesc: ND, effect: boolean, returns: 'CONDITION'): boolean;
    not(positiveDesc: PD, negativeDesc: ND): Condition<ND, PD>;
    not(positiveDesc: PD, negativeDesc: ND, effect: boolean): Condition<ND, PD>;
    not(positiveDesc: PD, negativeDesc: ND, effect: boolean, returns: 'CHAIN'): Condition<ND, PD>;
    not(positiveDesc: PD, negativeDesc: ND, effect: boolean, returns: 'PARAMETER'): boolean;
    not(positiveDesc: PD, negativeDesc: ND, effect: boolean, returns: 'CONDITION'): boolean;
    /**
     * 处理运算结果
     * @param handler 处理器
     * @return 处理器执行结果
     */
    result<R>(handler: fns.HandlerPs2<R, boolean, PD, ND>): R;
    /**
     * 执行处理
     * @param rc 参考条件
     * @param value 值
     * @param effect 运算结果是否影响当前条件
     * @param returns 返回值类型
     * @param [paramCondition] 参数中的条件, 未指定时返回当前条件
     * @private
     */
    private exec;
}
export declare class Logics {
    /**
     * 构建条件赋值逻辑对象
     * @param condition 条件
     * @param value 值
     * @see Switcher
     */
    static case<R, T = unknown>(condition: boolean, value: fns.OrGetter<R, T>): Switcher<R, T>;
    /**
     * 条件记录器
     * @param [c=true] 默认条件
     */
    static condition<PD = string, ND = string>(c?: boolean): Condition<PD, ND>;
}
