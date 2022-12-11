import { types } from '../types/types';
import { fns } from '../types/fns';
export declare class Promises {
    /**
     * 数据包装为异步
     * @param data 目标数据
     */
    static from<T>(data: T): Promise<T>;
    /**
     * 包装数据或数据获取器
     * @param og 数据或数据获取器
     */
    static of<R, T = void>(og: fns.OrAsyncGetter<T, R>): Promise<R>;
    /**
     * 增强原生Promise功能
     * @param src 原始Promise
     */
    static control<T = void>(src: Promise<T>): types.PromiseControl<T>;
}
