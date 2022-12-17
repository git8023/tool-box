import { fns } from '../types/fns';
import { types } from '../types/types';
export declare namespace asi {
    /**
     * 错误事件数据
     */
    type ErrorEventData<T, R> = {
        self: AsyncArrayStream<T, R>;
        error: Error;
    };
    /**
     * 元素事件数据
     */
    type ElementEventData<T, R> = {
        /**
         * 数据项
         */
        item: T;
        /**
         * 数据索引
         */
        index: number;
        /**
         * 当前对象
         */
        self: AsyncArrayStream<T, R>;
        /**
         * 中断后续
         * @param data 中断信息
         */
        broken(data: any): void;
    };
    /**
     * 处理结果数据
     */
    type ResultEventData<T> = {
        result: T;
        broken?: any;
        brokenType?: asi.BrokenType;
    };
    /**
     * 可用事件
     */
    type Event<T, R> = {
        /**
         * 开始执行前调用
         */
        begin?: fns.Handler<AsyncArrayStream<T, R>, types.FalsyLike>;
        /**
         * 元素节点处理
         */
        element?: fns.Handler<ElementEventData<T, R>, fns.OrAsyncGetter<void, types.FalsyLike>>;
        /**
         * 目标数组为空时执行.
         *
         * 如果有返回数据，此数据将替换原来的数组
         */
        empty?: fns.Handler<AsyncArrayStream<T, R>, fns.OrAsyncGetter<void, T[] | void>>;
        /**
         * 处理完成
         */
        done?: fns.Handler<AsyncArrayStream<T, R>, R>;
        /**
         * 出现错误时
         */
        error?: fns.Handler<ErrorEventData<T, R>, R>;
    };
    type BrokenType = 'MANUAL' | 'ELEMENT_ITERATOR_HANDLE:FALSE';
}
/**
 * 数组异步迭代器
 */
export declare class AsyncArrayStream<T, R = any> {
    /**
     * 游标
     * @private
     */
    private cursor;
    /**
     * 事件
     * @private
     */
    private events;
    /**
     * 目标数据异步获取器
     * @private
     */
    private array$;
    /**
     * 最终获取的数据
     * @private
     */
    private elements;
    /**
     * 最终处理结果
     * @private
     */
    private result?;
    /**
     * 是否已经结束
     * @private
     */
    private isOver;
    /**
     * 中断信息
     * @private
     */
    private brokenInfo?;
    /**
     * 中断类型
     * @private
     */
    private brokenType?;
    /**
     * 结果委托
     * @private
     */
    private delegateResult?;
    /**
     * 等待处理结果的Promise
     * @private
     */
    private waitPromise;
    /**
     * 将一个数组(或数据获取函数)包装为异步处理
     * @param arrayGetter 目标数组
     */
    constructor(arrayGetter: fns.OrAsyncGetter<void, T[]>);
    /**
     * 将一个数组(或数据获取函数)包装为异步处理
     * @param array 目标数组
     */
    static from<T, R = T>(array: fns.OrAsyncGetter<void, T[]>): AsyncArrayStream<T, R>;
    /**
     * 监听开始处理元素前事件
     * @param handler 事件处理器
     */
    onBegin(handler: fns.Handler<AsyncArrayStream<T, R>, types.FalsyLike>): AsyncArrayStream<T, R>;
    /**
     * 监听节点事件
     * @param handler 事件处理器
     */
    onElement(handler: fns.Handler<asi.ElementEventData<T, R>, fns.OrAsyncGetter<void, types.FalsyLike>>): AsyncArrayStream<T, R>;
    /**
     * 如果目标数组是空或无效时
     * @param handler 事件处理器
     */
    onEmpty(handler: fns.Handler<AsyncArrayStream<T, R>, fns.OrAsyncGetter<void, T[] | void>>): AsyncArrayStream<T, R>;
    /**
     * 处理完成
     * @param handler 事件处理器
     */
    onDone(handler: fns.Handler<AsyncArrayStream<T, R>, any>): AsyncArrayStream<T, R>;
    /**
     * 获取下一个元素
     */
    next(): Promise<void>;
    /**
     * 手动中断
     * @param brokenData 终端携带的数据
     * @param [type='MANUAL'] 中断类型
     */
    broken(brokenData?: any, type?: asi.BrokenType): void;
    /**
     * 获取最终处理结果, 如果结果中包含 broken 表示处理被中断
     */
    getResult(): Promise<asi.ResultEventData<R>>;
    /**
     * 初始化
     * @param arrayGetter 数据或数据获取函数
     */
    private init;
    /**
     * 重置为初始化状态
     * @private
     */
    private reset;
    /**
     * 等待数据返回
     * @private
     */
    private await;
    /**
     * 捕获异常中断
     * @param error 异常信息
     * @private
     */
    private catch;
    /**
     * 执行结果委托函数
     * @private
     */
    private callDelegateResult;
}
