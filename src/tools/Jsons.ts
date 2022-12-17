import { fns } from '../types/fns';
import { Arrays } from './Arrays';
import { Cast } from './Cast';
import { Functions } from './Functions';
import { PropChains } from './PropChains';
import { Validation } from './Validation';

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
   * @param o 对象
   * @param handler 返回false停止后续, 否则直到结束
   */
  static foreach<T extends { [s in K]: P }, K extends keyof T, P extends T[K]>(
    o: T,
    handler: fns.ObjectIteratorHandler<P>
  ) {
    if (Validation.nullOrUndefined(o)) {
      return;
    }

    Arrays.foreach(Object.keys(o), el => {
      return handler({ item: o[el.item as keyof T], index: el.item });
    });
  }

  /**
   * 把src浅克隆到dist中
   * @param src 数据对象
   * @param dist 目标对象
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
  static computeIfAbsent<T extends Partial<{ [p in K]: R }>, K extends keyof T, R>(
    store: T,
    key: K,
    fp: R | ((
      store: T,
      key: string | keyof T
    ) => R)
  ): R {

    // 数组
    if (Validation.is(store, 'Array') && store instanceof Array) {
      const val: R = this.get(store, key);
      if (Validation.notNil(val)) {
        return val;
      }

      const newlyVal = Functions.execOrGetter(fp, store, key);
      Jsons.set(store, key, newlyVal);
      return newlyVal;
    }

    if (key in store) {
      return <R>store[key];
    }

    const newlyVal = Functions.execOrGetter(fp, store, key);
    Jsons.set(store, key, newlyVal);
    return newlyVal;
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
    if (!data) {
      return data;
    }

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

  /**
   * 设置属性值
   * @param o 目标对象
   * @param propChain 属性链
   * @param v 值
   */
  static set<R, T = any>(
    o: T,
    propChain: (keyof T) | string,
    v: R
  ): R {
    return PropChains.setValue(o, String(propChain), v);
  }

  /**
   * 对象属性平铺
   * @param src 目标对象
   * @param convert 转换函数
   * @return 转换结果
   */
  static flat<T extends { [s in K]: P }, K extends keyof T, P extends T[K], R = any>(
    src: T,
    convert: fns.ObjectIteratorHandler<P, R>
  ): R[] {
    const results: R[] = [];
    this.foreach(src, iter => {
      const result = convert(iter);
      results.push(result);
    });
    return results;
  }

  /**
   * 清空对象所有属性
   * @param o 目标对象
   */
  static clear<T extends object>(o: T): T {
    this.foreach(o, iter => {
      o[iter.index as keyof T] = undefined as any;
    });
    return o;
  }
}
