import { fns } from '../types/fns';

type Watcher = fns.HandlerT9<void, any>;

export class Reflections {

  private static watchers = Symbol('watchers');
  private static values = Symbol('values');
  private static watched = Symbol('watched');

  /**
   * 观察对象指定属性, 可多次观察
   * @param o 目标对象
   * @param prop 已有属性或新增属性
   * @param watcher 观察者, 相同观察者只能注册一次
   * @return 被观察对象
   */
  static watch<T extends { [A in P]: T[A] }, P extends string | keyof T>(
    o: T,
    prop: P,
    watcher: Watcher,
  ): T {

    // 定义监听器映射
    const [watchersMapper] = this.constValue(
      o,
      Reflections.watchers,
      {} as Record<P, Watcher[]>,
    );

    // 保存监听器
    watchersMapper[prop] = watchersMapper[prop] || [];
    const watchers = watchersMapper[prop];
    if (!watchers.includes(watcher)) {
      watchers.push(watcher);
    }

    // 值缓存
    const [values, isFirstSet] = this.constValue(
      o,
      Reflections.values,
      {} as Record<P, T[P]>,
    );

    // 首次代理需要拷贝原有值
    if (isFirstSet) {
      Object.assign(values, o);
    }

    // 一个属性仅观察一次
    const [watchedMapper] = this.constValue(o, Reflections.watched, {} as Record<P, boolean>);
    if (Reflect.has(watchedMapper, prop)) {
      return o;
    }

    // 观察属性
    const descriptor = Reflect.getOwnPropertyDescriptor(o, prop) ?? {
      configurable: true,
      enumerable: true,
    };
    Reflect.defineProperty(o, prop, {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      get: () => values[prop],
      set: (nv: any) => {
        const ov: T[P] = values[prop];
        values[prop] = nv;
        watchers.forEach((watcher) => {
          try {
            watcher(nv, ov);
          } catch (e) {
            console.warn(`观察者[${String(prop)}]执行错误`, e, watcher);
          }
        });
      },
    });
    watchedMapper[prop] = true;

    return o;
  }

  /**
   * 设置常量属性
   * @param o 目标对象
   * @param prop 属性
   * @param value 值
   * @return [R, FirstSet]
   */
  static constValue<T extends { [K in P]: T[K] }, P extends string | symbol | keyof T, R>(
    o: T,
    prop: P,
    value: R,
  ): [R, boolean] {
    value = o[prop] ?? value;
    if (Reflect.has(o, prop)) {
      return [value, false];
    }

    const isOk = Reflect.defineProperty(o, prop, {
      value,
      configurable: true,
      enumerable: false,
      writable: false,
    });
    if (!isOk) {
      throw Error('属性代理失败');
    }
    return [value, true];
  }

}
