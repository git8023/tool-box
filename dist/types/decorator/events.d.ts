import { fns } from '../types/fns';
/**
 * 针对Vue函数
 */
export declare class Events {
    /**
     * 防抖, 指定时间内只执行第一次
     * @param duration 持续时长
     * @param debounceProp 防抖属性(执行期间设值为true, 等待 <i>duration</i> 毫秒后设值为false)
     */
    static debouncer<C>(duration?: number, debounceProp?: keyof C): import("vue-class-component").VueDecorator;
    /**
     * 防抖可中断的, 目标函数会等待指定时间后执行. 期间如果执行了中断函数就会打断目标函数的执行.
     * @param interrupt 中断函数名
     * @param [duration=300] 等待持续时长(ms)
     */
    static debounceController<T extends Record<K, Function>, K extends keyof T>(interrupt: K, duration?: number): import("vue-class-component").VueDecorator;
    /**
     * 记录日志
     * @param [params=true] 打印请求参数
     * @param [returns=false] 打印返回值
     */
    static log(params?: boolean, returns?: boolean): import("vue-class-component").VueDecorator;
    /**
     * 延迟执行直到断言成功
     * @param predicate 断言函数
     * @param [lazy=10] 首次执行延迟时间(ms)
     * @param [interval=10] 第N+1次断言间隔时间(ms)
     */
    static lazy<T>(predicate: fns.Handler<T, boolean>, lazy?: number, interval?: number): import("vue-class-component").VueDecorator;
    /**
     * 观察者
     * @param observe 观察逻辑
     * @param [beforeBroken=true] 当state==='before'时observe返回false是否允许中断目标函数执行
     * @param [useResult=false] 是否使用观察结果
     */
    static observe<R = any>(observe: fns.Handler<{
        stage: 'before' | 'after' | 'error';
        args?: any[];
        data?: R;
        error?: any;
    }, boolean | void>, beforeBroken?: boolean, useResult?: boolean): import("vue-class-component").VueDecorator;
    /**
     * 观察者
     * @param points 切入点配置项
     * @see observe
     */
    static observeRun<T = any>(points: {
        before?: keyof T;
        after?: keyof T;
        catcher?: keyof T;
        final?: keyof T;
    }): import("vue-class-component").VueDecorator;
    /**
     * 闪烁指定属性. 执行前熄灭执行后亮起.
     * @param blinkProp 闪烁属性
     * @param [duration=10] 熄灭持续时长(ms)
     */
    static blink<T, P extends keyof T = keyof T>(blinkProp: P, duration?: number): import("vue-class-component").VueDecorator;
}
