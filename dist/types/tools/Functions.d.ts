import { fns } from '../types/fns';
export declare class Functions {
    /**
     * 调用函数
     * @param fn 函数引用，如果要指定上下文需要传递Lambda函数
     * @param [args] 参数
     * @return 函数返回值
     */
    static call<R, T = void>(fn?: fns.HandlerT9<R, T, any, any, any, any, any, any, any, any>, ...args: any[]): R | undefined;
    /**
     * 调用函数
     * @param fn 函数引用，如果要指定上下文需要传递Lambda函数
     * @param [thisArg=undefined] 执行上下文
     * @param [args] 参数
     * @return 函数返回值
     */
    static exec<R, T = void>(fn?: fns.HandlerT9<R, T, any, any, any, any, any, any, any, any>, thisArg?: any, ...args: any[]): R | undefined;
    /**
     * 执行数据获取函数
     * @param vog 数据或数据获取函数
     * @param [args] 执行参数
     */
    static execOrGetter<T, I = void>(vog: fns.OrGetter<T, I>, ...args: any[]): T;
    /**
     * 执行异步获取函数
     * @param oag 数据或同步/异步数据获取函数
     * @param [args] 函数执行参数
     */
    static execOrAsyncGetter<T>(oag: fns.OrAsyncGetter<void, T>, ...args: any[]): Promise<T>;
    /**
     * 延迟执行
     * @param call 函数体
     * @param [loop=false] 是否持续执行
     * @param [lazy=0] 延迟时间(ms)
     * @param [immediate=false] 立即执行一次(异步)
     * @param [args=undefined] 执行参数
     */
    static timer(call: fns.Caller, loop?: boolean, lazy?: number, immediate?: boolean, ...args: any[]): void;
}
