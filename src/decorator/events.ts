import { createDecorator } from 'vue-class-component';
import { Logs } from '../tools/Logs';
import { Strings } from '../tools/Strings';

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

}
