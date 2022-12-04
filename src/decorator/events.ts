import { createDecorator } from 'vue-class-component';
import { Logs } from '../tools/Logs';
import { Strings } from '../tools/Strings';
import { Validation } from '../tools/Validation';
import { fns } from '../types/fns';
import { types } from '../types/types';
import FalsyLike = types.FalsyLike;
import { Functions } from '../tools/Functions';

/**
 * 针对Vue函数
 */
export class Events {

  /**
   * 防抖, 指定时间内只执行第一次
   * @param duration 持续时长
   * @param debounceProp 防抖属性(执行期间设值为true, 等待 <i>duration</i> 毫秒后设值为false)
   */
  static debouncer<C>(
    duration = 100,
    debounceProp?: keyof C
  ) {
    Logs.info('[Events.debouncer] Execute debouncer');
    return createDecorator((
      options,
      fnKey,
    ) => {

      const fn = options.methods[fnKey];
      debounceProp = (debounceProp || `__${fnKey}__${Strings.guid()}`) as keyof C;

      Logs.info('[Events.debouncer] Redefine function: ', fnKey);
      options.methods[fnKey] = function (...args: any[]) {
        if (this[debounceProp] === true) {
          Logs.info(`[Events.debouncer] 函数[${fnKey}]需要等待上次防抖结束`);
          return;
        }

        this[debounceProp] = true;
        Logs.info('[Events.debouncer] Executing function: ', fnKey);
        fn.apply(this, args);
        setTimeout(() => this[debounceProp] = false, duration);
      };

    });
  }

  /**
   * 防抖可中断的, 目标函数会等待指定时间后执行. 期间如果执行了中断函数就会打断目标函数的执行.
   * @param interrupt 中断函数名
   * @param [duration=300] 等待持续时长(ms)
   */
  static debounceController<T extends Record<K, Function>, K extends keyof T>(
    interrupt: K,
    duration = 300
  ) {
    return createDecorator((
      target,
      fnKey
    ) => {
      const originFn = target.methods[fnKey];
      if (!(originFn instanceof Function))
        throw new Error(`[Events.debounceController] 目标属性不是可执行函数: ${fnKey}`);

      const interrupter = target.methods[interrupt];
      if (!(interrupter instanceof Function))
        throw new Error(`[Events.debounceController] 中断函数无效, 指定属性不是可执行函数: ${String(interrupt)}`);

      let originFnTimer: any;
      target.methods[fnKey] = function (...args: any[]) {
        Logs.info(`[Events.debounceController] 函数[${fnKey}]延迟执行 ${duration} ms`);
        originFnTimer = setTimeout(() => originFn.bind(this)(...args), duration);
      };

      target.methods[interrupt] = function (...args: any[]) {
        Logs.info(`[Events.debounceController] 函数[${fnKey}]执行被[${String(interrupt)}]中断, 执行函数[${String(interrupt)}]`);
        clearTimeout(originFnTimer);
        interrupter.bind(this)(...args);
      };
    });
  }

  /**
   * 记录日志
   * @param [params=true] 打印请求参数
   * @param [returns=false] 打印返回值
   */
  static log(
    params = true,
    returns = true
  ) {

    return createDecorator((
      vm,
      fnKey
    ) => {

      const fn = vm.methods[fnKey];
      vm.methods[fnKey] = (...args: any[]) => {

        const filename = String(vm.__file).split('/').pop();
        const vmClsName = String(filename).split('.')[0];
        const prefix = `[${vmClsName}.${fnKey}]`;
        if (params) Logs.debug(prefix, ' Parameters: ', args);

        const data = fn(...args);
        if (returns && Validation.notNullOrUndefined(data))
          Logs.debug(prefix, ' Returns: ', data);

        return data;
      };

    });
  }

  /**
   * 延迟执行直到断言成功
   * @param predicate 断言函数
   * @param [lazy=10] 首次执行延迟时间(ms)
   * @param [interval=10] 第N+1次断言间隔时间(ms)
   */
  static lazy<T>(
    predicate: fns.Handler<T, boolean>,
    lazy = 10,
    interval?: number
  ) {

    lazy = (0 < lazy) ? lazy : 10;
    interval = interval ?? lazy;
    interval = (0 <= interval) ? interval : lazy;

    return createDecorator((
      options,
      fnKey
    ) => {

      const fn = options.methods[fnKey];
      options.methods[fnKey] = function (...args: any[]) {
        const vm = this;
        const fnWrapper = (): boolean => {
          const result = !!Functions.call(predicate, vm);
          result && fn.bind(vm)(...args);
          return result;
        };

        setTimeout(() => {
          fnWrapper();
          const intervalId = setInterval(() => fnWrapper() && clearInterval(intervalId), interval);
        }, lazy);
      };

    });
  }

}
