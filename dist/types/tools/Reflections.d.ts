import { fns } from '../types/fns';
declare type Watcher = fns.HandlerT9<void, any>;
export declare class Reflections {
    private static watchers;
    private static values;
    private static watched;
    /**
     * 观察对象指定属性, 可多次观察
     * @param o 目标对象
     * @param prop 已有属性或新增属性
     * @param watcher 观察者, 相同观察者只能注册一次
     * @return 被观察对象
     */
    static watch<T extends {
        [A in P]: T[A];
    }, P extends string | keyof T>(o: T, prop: P, watcher: Watcher): T;
    /**
     * 设置常量属性
     * @param o 目标对象
     * @param prop 属性
     * @param value 值
     * @return [R, FirstSet]
     */
    static constValue<T extends {
        [K in P]: T[K];
    }, P extends string | symbol | keyof T, R>(o: T, prop: P, value: R): [R, boolean];
}
export {};
