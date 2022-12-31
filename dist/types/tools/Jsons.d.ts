import { fns } from '../types/fns';
import { types } from '../types/types';
export declare class Jsons {
    /**
     * 浅层合并两个对象
     * @param src 数据提供者
     * @param dest 数据接受者
     * @param [recover=true] 出现同名属性是否允许覆盖；
     *                        指定为false时不会执行合并操作, 并可通过返回值获取具体重复的属性名列表
     * @returns 检测到重复的属性名, 如果不存在重复属性名总是返回空数组
     */
    static merge<T extends object>(src: T, dest: T, recover?: boolean): string[];
    /**
     * 提取对象列表中重复的属性名
     * @param vs 对象列表
     * @returns 通过枚举方式查找的重复属性名列表
     */
    static extractRepeatKeys<T>(...vs: T[]): string[];
    /**
     * 对象深拷贝, 只针对JSON对象有效
     * @param o 目标对象
     * @returns 拷贝后对象
     */
    static simpleClone<T>(o: T): T;
    /**
     * 便利对象属性
     * @param o 目标对象
     * @param handler 迭代处理器
     */
    static foreach<T extends {
        [S in K]: T[S];
    }, K extends keyof T = keyof T, P extends T[K] = T[K]>(o: T, handler: fns.ObjectIteratorHandler<P>): void;
    /**
     * 便利对象属性
     * @param o 目标对象
     * @param handler 迭代处理器
     * @param sync 异步处理
     */
    static foreach<T extends {
        [S in K]: T[S];
    }, K extends keyof T = keyof T, P extends T[K] = T[K]>(o: T, handler: fns.ObjectIteratorHandler<P, types.FalsyLike | Promise<types.FalsyLike>>, sync: false): Promise<T>;
    /**
     * 把src浅克隆到dist中
     * @param src 数据对象
     * @param dist 目标对象
     */
    static cover<T extends object>(src?: any, dist?: T): T;
    /**
     * 从对象中获取值, 如果没有就计算并保存新值
     * @param store 数据仓库
     * @param key 属性名
     * @param fp 属性值计算过程
     */
    static computeIfAbsent<T extends Partial<{
        [p in K]: R;
    }>, K extends keyof T, R>(store: T, key: K, fp: R | ((store: T, key: string | keyof T) => R)): R;
    /**
     * 对象紧凑处理
     * @param data 数据对象(无副作用)
     * @param [recursion] 是否递归处理
     * @param [nullable] 是否保留null|undefined
     * @param [emptyStr] 是否保留空字符串
     * @param [emptyObj] 是否保留空对象
     * @param [emptyArray] 是否保留空数组
     * @return 数据对象克隆对象
     */
    static compact<T extends object>(data: T, recursion?: boolean, nullable?: boolean, emptyStr?: boolean, emptyObj?: boolean, emptyArray?: boolean): T;
    /**
     * 获取对象属性值
     * @param o json对象
     * @param propChain 属性链; e.g: foo.bar, foo[0].bar, ...
     * @return 属性值
     */
    static get<R, T = any>(o: T, propChain: (keyof T) | string): R;
    /**
     * 设置属性值
     * @param o 目标对象
     * @param propChain 属性链
     * @param v 值
     */
    static set<R, T = any>(o: T, propChain: (keyof T) | string, v: R): R;
    /**
     * 对象属性平铺
     * @param src 目标对象
     * @param convert 转换函数
     * @return 转换结果
     */
    static flat<T extends {
        [s in K]: P;
    }, K extends keyof T, P extends T[K], R = any>(src: T, convert: fns.ObjectIteratorHandler<P, R>): R[];
    /**
     * 清空对象所有属性
     * @param o 目标对象
     */
    static clear<T extends object>(o: T): T;
}
