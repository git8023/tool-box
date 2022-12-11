import { types } from '../types/types';
import { fns } from '../types/fns';
export declare class Validation {
    /**
     * 校验一系列值是否为不可用的值(null/undefined)
     * @param vs 值列表
     * @returns true-全部都是null/undefined, false-当找到至少一个不是null/undefined
     */
    static nullOrUndefined(...vs: any[]): boolean;
    /**
     * 校验单个值是否为null/undefined
     * @param v 目标值
     * @returns true-目标值是null/undefined, false-目标值不是null/undefined
     */
    static isNullOrUndefined(v: any): boolean;
    /**
     * 校验指定值是否已定义(非null/undefined)
     * @param v 目标值
     * @returns true-值已定义, false-值未定义
     */
    static notNullOrUndefined(v: any): boolean;
    /**
     * 校验目标值是否真值
     * @param v 目标值
     * @returns true-目标值为真值, false-目标值为假值
     */
    static isTruthy(v: any): boolean;
    /**
     * 校验目标值是否假值
     * @param v 目标值
     * @returns true-目标值为假值 false-目标值为真值,
     */
    static isFalsy(v: any): boolean;
    /**
     * 校验是否为指定类型
     * @param v 目标值
     * @param type 类型
     */
    static is(v: any, type: types.TypeString): boolean;
    /**
     * 校验值是否为指定类型之一
     * @param v 目标数据
     * @param type 类型A
     * @param [types] 其他类型
     * @return 目标数据满足任意指定类型返回true,否则返回false
     */
    static isOr<T>(v: T, type: types.TypeString, ...types: types.TypeString[]): boolean;
    /**
     * 校验是否不是指定类型
     * @param v 值
     * @param type 类型
     * @return 如果是指定类型返回true, 否则返回false
     */
    static isNot(v: any, type: types.TypeString): boolean;
    /**
     * 校验对象是否为: null/undefined/空字符串/空数组/空对象
     * @param o 被校验对象
     */
    static isEmpty<T>(o: T): boolean;
    /**
     * 校验对象是否不为: null/undefined/空字符串/空数组/空对象
     * @param o 被校验对象
     * @return {boolean}
     * @see isEmpty
     */
    static notEmpty<T>(o: T): boolean;
    /**
     * 校验两个对象是否具有相同属性
     * <pre>
     * isEq(null, null);        // true
     * isEq(null, undefined);   // true
     *
     * let b = a;
     * isEq(a, b);    // true
     *
     * leb b = JSON.parse(JSON.stringify(a));
     * isEq(a, b);    // true
     *
     * </pre>
     * @param a 对象a
     * @param b 对象b
     * @return 校验通过返回true, 否则返回false
     */
    static isEq(a: any, b: any): boolean;
    /**
     * 校验对象是否为可执行函数
     * @param o 目标对象
     * @return 是可执行函数返回true, 否则返回false
     */
    static isFunction(o: any): boolean;
    /**
     * 校验对象属性值是否有效
     * @param o 目标对象
     * @param validator 验证器
     * @return 成功返回true，失败返回false
     */
    static validate<T>(o: T, validator: types.RecordSTP<T, fns.ObjectIteratorHandler<T[keyof T]>>): boolean;
    /**
     * 校验对象属性值是否有效
     * @param o 目标对象
     * @param validator 验证器
     * @param async 异步校验
     * @return 成功返回true，失败返回false
     */
    static validate<T>(o: T, validator: types.RecordSTP<T, fns.ObjectIteratorHandler<T[keyof T], Promise<types.FalsyLike>>>, async: true): Promise<boolean>;
}
