import { fns } from '../types/fns';
export declare class Broadcast<C, K = keyof C> {
    /**
     * 订阅关系
     *
     * K - 频道
     *
     * V - 处理器
     */
    subscribers: Map<K, fns.Consume<any>[]>;
    /**
     * 发送事件
     * @param channel 频道
     * @param args 事件参数
     */
    emit(channel: K, args?: any): Broadcast<C, K>;
    /**
     * 监听
     * @param channel 频道
     * @param fn 处理函数
     * @param [immediate=false] 是否立即执行一次
     * @param [lazy=0] 延迟执行, 仅<i>immediate===true</i>时有效
     * @param [args=undefined] 执行参数
     */
    on(channel: K, fn: fns.Consume<any>, immediate?: boolean, lazy?: number, ...args: any[]): Broadcast<C, K>;
    /**
     * 取消监听
     * @param channel 频道
     * @param fn 处理函数
     */
    off(channel: K, fn: fns.Consume<any>): Broadcast<C, K>;
    /**
     * 获取处理器数组
     * @param channel 频道
     * @private
     */
    private get;
}
