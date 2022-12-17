import { fns } from '../types/fns';
import { types } from '../types/types';
import { BError } from './BError';
import { Functions } from './Functions';
import { Logs } from './Logs';
import { Promises } from './Promises';
import { Validation } from './Validation';

// 异步数组相关类型定义
export namespace asi {

  /**
   * 错误事件数据
   */
  export type ErrorEventData<T, R> = { self: AsyncArrayStream<T, R>, error: Error };

  /**
   * 元素事件数据
   */
  export  type ElementEventData<T, R> = {

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
  }

  /**
   * 处理结果数据
   */
  export type ResultEventData<T> = { result: T, broken?: any, brokenType?: asi.BrokenType };

  /**
   * 可用事件
   */
  export type Event<T, R> = {
    /**
     * 开始执行前调用
     */
    begin?: fns.Handler<AsyncArrayStream<T, R>, types.FalsyLike>,

    /**
     * 元素节点处理
     */
    element?: fns.Handler<ElementEventData<T, R>, fns.OrAsyncGetter<void, types.FalsyLike>>,

    /**
     * 目标数组为空时执行.
     *
     * 如果有返回数据，此数据将替换原来的数组
     */
    empty?: fns.Handler<AsyncArrayStream<T, R>, fns.OrAsyncGetter<void, T[] | void>>,

    /**
     * 处理完成
     */
    done?: fns.Handler<AsyncArrayStream<T, R>, R>,

    /**
     * 出现错误时
     */
    error?: fns.Handler<ErrorEventData<T, R>, R>,
  }

  export type BrokenType = 'MANUAL' | 'ELEMENT_ITERATOR_HANDLE:FALSE'
}

/**
 * 数组异步迭代器
 */
export class AsyncArrayStream<T, R = any> {

  /**
   * 游标
   * @private
   */
  private cursor = 0;

  /**
   * 事件
   * @private
   */
  private events: asi.Event<T, R> = {};

  /**
   * 目标数据异步获取器
   * @private
   */
  private array$!: Promise<T[]>;

  /**
   * 最终获取的数据
   * @private
   */
  private elements!: T[];

  /**
   * 最终处理结果
   * @private
   */
  private result?: R;

  /**
   * 是否已经结束
   * @private
   */
  private isOver = false;

  /**
   * 中断信息
   * @private
   */
  private brokenInfo?: any;

  /**
   * 中断类型
   * @private
   */
  private brokenType?: asi.BrokenType;

  /**
   * 结果委托
   * @private
   */
  private delegateResult?: fns.Consume<asi.ResultEventData<R>>;

  /**
   * 等待处理结果的Promise
   * @private
   */
  private waitPromise!: types.PromiseControl<void>;

  /**
   * 将一个数组(或数据获取函数)包装为异步处理
   * @param arrayGetter 目标数组
   */
  constructor(arrayGetter: fns.OrAsyncGetter<void, T[]>) {
    this.init(arrayGetter);
  }

  /**
   * 将一个数组(或数据获取函数)包装为异步处理
   * @param array 目标数组
   */
  static from<T, R = T>(array: fns.OrAsyncGetter<void, T[]>) {
    return new AsyncArrayStream<T, R>(array);
  }

  /**
   * 监听开始处理元素前事件
   * @param handler 事件处理器
   */
  onBegin(handler: fns.Handler<AsyncArrayStream<T, R>, types.FalsyLike>): AsyncArrayStream<T, R> {
    this.events.begin = handler;
    return this;
  }

  /**
   * 监听节点事件
   * @param handler 事件处理器
   */
  onElement(handler: fns.Handler<asi.ElementEventData<T, R>, fns.OrAsyncGetter<void, types.FalsyLike>>): AsyncArrayStream<T, R> {
    this.events.element = handler;
    return this;
  }

  /**
   * 如果目标数组是空或无效时
   * @param handler 事件处理器
   */
  onEmpty(handler: fns.Handler<AsyncArrayStream<T, R>, fns.OrAsyncGetter<void, T[] | void>>): AsyncArrayStream<T, R> {
    this.events.empty = handler;
    return this;
  }

  /**
   * 处理完成
   * @param handler 事件处理器
   */
  onDone(handler: fns.Handler<AsyncArrayStream<T, R>, any>): AsyncArrayStream<T, R> {
    this.events.done = handler;
    return this;
  }

  /**
   * 获取下一个元素
   */
  next(): Promise<void> {
    return Functions.execOrAsyncGetter<any>(() => {
      if (this.isOver) {
        return Promise.reject('数据已经处理完成');
      }

      // 首次调用前
      if (this.cursor === 0) {
        this.isOver = (false === Functions.call(this.events.begin, this));
        if (this.isOver) {
          return;
        }
      }

      // 空数组
      const elements = this.elements || [];
      if (0 === elements.length) {
        const valOfSecond = Functions.execOrAsyncGetter(this.events.empty as any, this)!;
        if (Validation.isNil(valOfSecond)) {
          this.isOver = true;
          return;
        } else {
          this.reset();
          this.array$ = valOfSecond;
          return this.next();
        }
      }

      // 递归结束
      if (this.cursor === elements.length) {
        return;
      }

      // 遍历每个元素
      const item = elements[this.cursor];
      const itemData: asi.ElementEventData<T, R> = {
        index: this.cursor++,
        item,
        self: this,
        broken: this.broken.bind(this)
      };
      const itemHandleResult = Functions.call(this.events.element, itemData);
      return Functions
        .execOrAsyncGetter(itemHandleResult)
        .then((itemResult) => {
          if (!itemResult) {
            Logs.debug(`元素迭代返回结果:[${itemResult}], 是否终止后续处理:[${!itemResult}]`, itemData);
            this.broken({ ...itemData, self: undefined }, 'ELEMENT_ITERATOR_HANDLE:FALSE');
            return;
          }
          return this.next();
        });
    });
  }

  /**
   * 手动中断
   * @param brokenData 终端携带的数据
   * @param [type='MANUAL'] 中断类型
   */
  broken(
    brokenData?: any,
    type: asi.BrokenType = 'MANUAL'
  ) {
    this.isOver = true;
    this.brokenInfo = brokenData;
    this.brokenType = type;
  }

  /**
   * 获取最终处理结果, 如果结果中包含 broken 表示处理被中断
   */
  getResult(): Promise<asi.ResultEventData<R>> {
    return new Promise((resolve) => this.delegateResult = resolve);
  }

  /**
   * 初始化
   * @param arrayGetter 数据或数据获取函数
   */
  private init(arrayGetter: fns.OrAsyncGetter<void, T[]>): Promise<void> {
    this.reset();

    this.array$ = Functions.execOrAsyncGetter(arrayGetter);
    return this.await();
  }

  /**
   * 重置为初始化状态
   * @private
   */
  private reset() {
    this.cursor = 0;
    this.isOver = false;
    this.result = undefined;
  }

  /**
   * 等待数据返回
   * @private
   */
  private await(): Promise<void> {
    if (this.waitPromise) {
      this.waitPromise.abort();
    }

    this.waitPromise = Promises.control(this.array$
                                            .then((data) => {
                                              this.elements = data;
                                              return this.next();
                                            })
                                            .then(() => {
                                              this.result = Functions.call(this.events.done, this);
                                              this.events.done = undefined;
                                              this.callDelegateResult();
                                            })
                                            .catch((e) => {
                                              this.catch(e);
                                            }));
    return this.waitPromise;
  }

  /**
   * 捕获异常中断
   * @param error 异常信息
   * @private
   */
  private catch(error: any) {
    const args = { self: this, error: BError.from(error) };
    this.result = Functions.call(this.events.error, args);
    this.broken(error);
    this.callDelegateResult();
  }

  /**
   * 执行结果委托函数
   * @private
   */
  private callDelegateResult() {
    const result: asi.ResultEventData<R> = {
      result: this.result!,
      broken: this.brokenInfo,
      brokenType: this.brokenType
    };
    Functions.call(this.delegateResult, result);
    this.delegateResult = undefined;
  }
}
