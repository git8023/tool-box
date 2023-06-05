import { fns } from '../types/fns';
/** 挂起等待条件完成后执行 */
export declare class Pending<T extends string> {
    private asyncCall;
    private conditions;
    private readonly awaits;
    constructor(asyncCall: fns.Consume<any>, conditions: T[]);
    /**
     * 创建实例
     * @param asyncCall 挂起结束回调
     * @param conditions 条件设定(重复条件只保留一个)
     */
    static create<C extends string>(asyncCall: fns.Caller, ...conditions: C[]): Pending<C>;
    /**
     * 完成指定条件
     * @param cKey 条件关键字
     */
    complete(cKey: T): Pending<T>;
    /**
     * 初始化
     * @example
     * await
     *    .all:
     *        each Promise(c)
     *    .then:
     *        call asyncCall
     * @private
     */
    private init;
}
