import { fns } from '../types/fns';
export declare class Observer {
    /**
     * 记录日志
     * @param [params=true] 打印请求参数
     * @param [returns=false] 打印返回值
     */
    static log(params?: boolean, returns?: boolean): (target: any, fnKey: string) => void;
    /**
     * 延迟执行直到断言成功
     * @param predicate 断言函数
     * @param [lazy=10] 首次执行延迟时间(ms)
     * @param [interval=10] 第N+1次断言间隔时间(ms)
     */
    static lazy: <T>(predicate: fns.HandlerPs<boolean, T>, lazy?: number, interval?: number) => (target: any, fnKey: string) => void;
    static x: (target: any, fnKey: string) => void;
}
