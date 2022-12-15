import { types } from './types';
export declare namespace fns {
    /**
     * 通用函数类型
     */
    interface Function {
        (...args: any[]): any | undefined;
    }
    /**
     * 数据处理器
     */
    interface Handler<T, R> {
        (data: T, ...args: any): R;
    }
    /**
     * 数据处理器, 任意多个参数
     *
     * @param C 执行上下文
     *
     * @param R 返回值
     */
    interface HandlerPs<R = void, C = void> extends Handler<any, R> {
        (c?: C, ...args: any[]): R;
    }
    /**
     * 多参数函数
     *
     * @see HandlerT9
     */
    interface HandlerT9C<R = void, C = void, T1 = void, T2 = void, T3 = void, T4 = void, T5 = void, T6 = void, T7 = void, T8 = void, T9 = void> extends Handler<T1, R> {
        (this: C, p1: T1, p2: T2, p3: T3, p4: T4, p5: T5, p6: T6, p7: T7, p8: T8, p9: T9): R;
    }
    /**
     * 多参数(最多9个)函数, 上下文void
     *
     * @see HandlerT9C
     */
    type HandlerT9<R = void, T1 = void, T2 = void, T3 = void, T4 = void, T5 = void, T6 = void, T7 = void, T8 = void, T9 = void> = HandlerT9C<R, void, T1, T2, T3, T4, T5, T6, T7, T8, T9>;
    /**
     * 数据消费处理器
     */
    type Consume<T> = Handler<T, void>;
    /**
     * 可调用的函数
     */
    type Caller = Consume<void>;
    /**
     * 数据获取处理器
     */
    type Getter<R, T = void> = Handler<T, R>;
    /**
     * 数据或数据获取处理器
     */
    type OrGetter<R, T = void> = R | Getter<R, T>;
    /**
     * 异步数据获取处理器
     */
    type AsyncGetter<T, R = void> = Handler<T, Promise<R>>;
    /**
     * 异步数据或异步数据获取处理器
     */
    type OrAsyncGetter<T, R> = OrGetter<R, T> | Promise<R> | AsyncGetter<T, Promise<R>>;
    /**
     * 对象映射处理器
     */
    type KeyMapper<T, R = types.KeyType> = Handler<T, R>;
    /**
     * 对象属性或映射处理器
     */
    type OrKeyMapper<T, R = types.KeyType> = types.KeyOf<T> | KeyMapper<T, R>;
    /**
     * 迭代映射处理器
     */
    type IteratorMapper<T, R = types.KeyOf<T>> = Handler<types.IteratorItem<T>, R>;
    /**
     * 元素属性名或迭代映射处理器
     */
    type OrIteratorMapper<T> = types.KeyOf<T> | IteratorMapper<T>;
    /**
     * 迭代处理器, 返回false终止
     */
    type IteratorHandler<T, R = types.FalsyLike, K = string | number> = Getter<R, types.IteratorItem<T, K>>;
    /**
     * 数组迭代处理器, 返回false终止
     */
    type ArrayIteratorHandler<T, R = types.FalsyLike> = IteratorHandler<T, R, number>;
    /**
     * 对象迭代处理器, 返回false终止
     */
    type ObjectIteratorHandler<T, R = types.FalsyLike> = IteratorHandler<T, R, string>;
    /**
     * 数组元素断言
     */
    type ArrayPredictor<T> = types.KeyOf<T> | fns.ArrayIteratorHandler<T, boolean>;
    /**
     * 数组键映射器
     */
    type ArrayKeyMapperHandler<T, R = string> = fns.ArrayIteratorHandler<T, R>;
    /**
     * 数组键映射器
     */
    type ArrayKeyMapper<T, R = string> = types.KeyOf<T> | ArrayKeyMapperHandler<T, R>;
}
