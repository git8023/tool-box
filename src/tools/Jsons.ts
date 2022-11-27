// 常规通用工具
import { Validation } from './Validation';
import { Arrays } from './Arrays';
import { Cast } from './Cast';
import { fns } from '../types/fns';
import { PropChains } from './PropChains';

export class Jsons {

  /**
   * 浅层合并两个对象
   * @param src 数据提供者
   * @param dest 数据接受者
   * @param [recover=true] 出现同名属性是否允许覆盖；
   *                        指定为false时不会执行合并操作, 并可通过返回值获取具体重复的属性名列表
   * @returns 检测到重复的属性名, 如果不存在重复属性名总是返回空数组
   */
  static merge<T extends object>(
    src: T,
    dest: T,
    recover = true
  ): string[] {
    const repeatedKeys = this.extractRepeatKeys<T>(src, dest);
    if (repeatedKeys.length) {
      if (!recover) {
        return repeatedKeys;
      }
    }
    Object.assign(dest, src);
    return [];
  }

  /**
   * 提取对象列表中重复的属性名
   * @param vs 对象列表
   * @returns 通过枚举方式查找的重复属性名列表
   */
  static extractRepeatKeys<T>(
    ...vs: T[]
  ): string[] {
    const keysArr = new Array<string[]>();
    const vsR = vs || [];
    if (undefined === vsR) {
      return [];
    }

    vsR.forEach(value => {
      if (Validation.notNullOrUndefined(value)) {
        keysArr.push(Object.keys(value as any));
      }
    });

    return Arrays.intersectionSimple<string>(keysArr);
  }


  /**
   * 对象深拷贝, 只针对JSON对象有效
   * @param o 目标对象
   * @returns 拷贝后对象
   */
  static simpleClone<T>(
    o: T
  ): T {
    if (Validation.isNullOrUndefined(o)) {
      // @ts-ignore
      return <T>null;
    }
    return JSON.parse(JSON.stringify(o));
  }

  /**
   * 遍历对象属性
   * @param o {object} 对象
   * @param handler 返回false停止后续, 否则直到结束
   */
  static foreach<T extends object, K extends keyof T, P extends T[K]>(
    o: T,
    handler: fns.ObjectIteratorHandler<P>
  ) {
    if (Validation.nullOrUndefined(o)) return;

    Arrays.foreach(Object.keys(o), el => {
      return handler({ item: o[el.item as keyof T] as P, index: el.item });
    });
  }

  /**
   * 把src浅克隆到dist中
   * @param src {object} 数据对象
   * @param dist {object} 目标对象
   */
  static cover<T extends object>(
    src: any = {},
    dist: T = Cast.as<any>({})
  ): T {
    this.foreach(dist, el => {
      dist[el.index as keyof T] = src[el.index] ?? el.item;
    });
    return dist;
  }


  /**
   * 从对象中获取值, 如果没有就计算并保存新值
   * @param store 数据仓库
   * @param key 属性名
   * @param fp 属性值计算过程
   */
  static computeIfAbsent<T extends Record<K, R>, K extends keyof T = keyof T, R extends T[K] = T[K]>(
    store: T,
    key: K,
    fp: R | ((
      store: T,
      key: string | keyof T
    ) => R)
  ): R {

    // 数组
    if (Validation.is(store, 'Array')) {
      const arr: any[] = Cast.as(store);
      const arrIndex: number = Cast.as(key);
      let el = arr[arrIndex];
      if (Validation.isNullOrUndefined(el)) {
        el = (fp instanceof Function) ? fp(store, key) : fp;
        arr.splice(arrIndex, 0, el);
      }
      return el;
    }

    if (key in store) {
      return <R>store[key];
    }

    const val = (fp instanceof Function) ? fp(store, key) : fp;
    store[key] = val;
    return val;
  }

  /**
   * 对象紧凑处理
   * @param data 数据对象(无副作用)
   * @param [recursion] 是否递归处理
   * @param [nullable] 是否保留null|undefined
   * @param [emptyStr] 是否保留空字符串
   * @param [emptyObj] 是否保留空对象
   * @param [emptyArray] 是否保留空数组
   * @return 数据对象克隆对象
   */
  static compact<T extends object>(
    data: T,
    recursion = false,
    nullable = false,
    emptyStr = false,
    emptyObj = false,
    emptyArray = false
  ): T {
    if (!data) return data;

    const delKey = (
      o: any,
      k: string | number
    ) => {
      if (Validation.is(o, 'Object')) {
        delete o[k];
      } else if (Validation.is(o, 'Array')) {
        o.splice(+k, 1);
      }
    };

    this.foreach(data, el => {
      if (Validation.isEmpty(el.item)) {
        if (Validation.isNullOrUndefined(el.item) && !nullable) {
          delKey(data, el.index);
          return;
        }
        if (Validation.is(el.item, 'String') && !emptyStr) {
          delKey(data, el.index);
          return;
        }
        if (Validation.is(el.item, 'Object') && !emptyObj) {
          delKey(data, el.index);
          return;
        }
        if (Validation.is(el.item, 'Array') && !emptyArray) {
          delKey(data, el.index);
          return;
        }
      }

      // recursion
      if (el.item instanceof Object && recursion) {
        el.item = this.compact(el.item);
        if (Validation.notEmpty(el.item)) {
          data[el.index as keyof T] = el.item;
          return;
        }

        if (Validation.is(el.item, 'Object') && !emptyObj) {
          delKey(data, el.index);
          return;
        }
        if (Validation.is(el.item, 'Array') && !emptyArray) {
          delKey(data, el.index);
          return;
        }
      }
    });

    return data;
  }

  /**
   * 获取对象属性值
   * @param o json对象
   * @param propChain 属性链; e.g: foo.bar, foo[0].bar, ...
   * @return 属性值
   */
  static get<R, T = any>(
    o: T,
    propChain: (keyof T) | string
  ): R {
    return PropChains.getValue(o, String(propChain));
  }
}
