import { Arrays } from './Arrays';
import { Functions } from './Functions';
import { fns } from '../types/fns';

export class Broadcast<C, K = keyof C> {
  /**
   * 订阅关系
   *
   * K - 频道
   *
   * V - 处理器
   */
  subscribers = new Map<K, fns.Consume<any>[]>();

  /**
   * 发送事件
   * @param channel 频道
   * @param args 事件参数
   */
  emit(
    channel: K,
    args?: any,
  ): Broadcast<C,K> {
    const handlers = this.get(channel);
    Arrays.foreach(handlers, (el) => {
      Functions.call(el.item, args);
    });
    return this;
  }

  /**
   * 监听
   * @param channel 频道
   * @param fn 处理函数
   * @param [immediate=false] 是否立即执行一次
   */
  on(
    channel: K,
    fn: fns.Consume<any>,
    immediate = false,
  ): Broadcast<C, K> {
    this.get(channel).push(fn);
    if (immediate) Functions.call(fn);
    return this;
  }

  /**
   * 取消监听
   * @param channel 频道
   * @param fn 处理函数
   */
  off(
    channel: K,
    fn: fns.Consume<any>,
  ): Broadcast<C, K> {
    const handlers = this.get(channel);
    Arrays.remove(handlers, fn);
    return this;
  }

  /**
   * 获取处理器数组
   * @param channel 频道
   * @private
   */
  private get(channel: K): fns.Consume<any>[] {
    let handlers = this.subscribers.get(channel);
    if (!handlers) this.subscribers.set(channel, handlers = []);
    return handlers;
  }
}
