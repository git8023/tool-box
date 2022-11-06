// 常规通用工具
import Validation from '@/tools/Validation';
import Arrays from '@/tools/Arrays';
import PropChains from '@/cls/PropChains';
import Cast from '@/tools/Cast';

export default class Jsons {

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

  //
  ///**
  // * 对象深拷贝, 只针对JSON对象有效
  // * @param o 目标对象
  // * @returns 拷贝后对象
  // */
  //static cloneDeep<T>(
  //  o: T
  //): T {
  //  if (Validation.isNullOrUndefined(o)) {
  //    // @ts-ignore
  //    return <T>null
  //  }
  //  return JSON.parse(JSON.stringify(o))
  //}
  //
  ///**
  // * 遍历对象属性
  // * @param o {object} 对象
  // * @param func 返回false停止后续, 否则直到结束
  // */
  //static foreach<T>(
  //  o: T,
  //  func: fns.Handler<T, types.FalsyLike>
  //) {
  //  if (Validation.nullOrUndefined(o)) return
  //  Arrays.foreach(Object.keys(o), k => {
  //    return func(o[k], k)
  //  })
  //}
  //
  ///**
  // * 把src浅克隆到dist中
  // * @param src {object} 数据对象
  // * @param dist {object} 目标对象
  // */
  //static as<T>(
  //  src: any = {},
  //  dist: T = converters.cast({})
  //): T {
  //  this.foreach(dist, (
  //    v,
  //    k
  //  ) => {
  //    // @ts-ignore
  //    dist[k] = defaultIfNullOrUndefined(src[k], dist[k])
  //  })
  //  return dist
  //}
  //
  ///**
  // * isNullOrUndefined(val) ? defV : val
  // * @param val 目标值
  // * @param defV 默认值
  // * @see validators#isNullOrUndefined
  // */
  //static defaultIfNullOrUndefined<T>(
  //  val: T,
  //  defV: T
  //): T {
  //  return Validation.isNullOrUndefined(val) ? defV : val
  //}
  //
  ///**
  // * 属性覆盖
  // * @param to {T extends StringKeysJson<any>} 目标对象
  // * @param from {any} 源对象
  // * @param [useTo=true] {boolean} true-从目标对象获取键列表, false-从源对象获取键列表
  // * @param [nullable=false] {boolean} true-允许null/undefined覆盖
  // * @return {any} 目标对象
  // */
  //static cover<T extends Part<any>>(
  //  to: any,
  //  from: any,
  //  useTo = true,
  //  nullable = false
  //): T {
  //  const keysFrom = this.cloneDeep(useTo ? to : from)
  //  Object.keys(keysFrom).forEach(k => {
  //    if (Validation.isNullOrUndefined(from[k]) && !nullable) {
  //      return
  //    }
  //    to[k] = from[k]
  //  })
  //  return to
  //}
  //
  ///**
  // * 属性值关联遍历
  // * @param a {Part} 属性名提供对象
  // * @param b {Part} 其他联合处理对象
  // * @return {WithKeysHandler}
  // */
  //static withKeys(
  //  a: Part<any>,
  //  b: Part<any>
  //): IMerge {
  //  let doneFn: any;
  //  const ret: IMerge = {
  //    each(func) {
  //      setTimeout(() => {
  //        this.foreach(a, (
  //          av,
  //          k
  //        ) => func(av, b[k], converters.cast(k)))
  //        ret._done(a, b)
  //        this.exec(ret, doneFn, a, b)
  //      })
  //      return ret
  //    },
  //    over(func) {
  //      doneFn = func;
  //      return ret
  //    },
  //    _done: <DoneHandler>((
  //      a,
  //      b
  //    ) => {
  //    })
  //  }
  //  return ret
  //}
  //
  ///**
  // * 字符串或JSON对象转JSON对象
  // * @param json {string|object} JSON字符串或者对象
  // * @return {object} JSON对象
  // */
  //static toJson<T>(
  //  json: string | any
  //): T {
  //  if (Validation.is(json, 'Object')) {
  //    return JSON.parse(JSON.stringify(json))
  //  }
  //
  //  if (Validation.is(json, 'String')) {
  //    return JSON.parse(<string>json)
  //  }
  //
  //  // @ts-ignore
  //  return <T>json
  //}
  //
  ///**
  // * 目标对象转换为JSON字符串
  // * @param obj {object|string} 目标对象
  // * @return {string} JSON字符串
  // */
  //static toJsonStr(
  //  obj: string | any
  //): string {
  //  if (Validation.isNot(obj, 'String')) {
  //    obj = JSON.stringify(obj)
  //  }
  //  return <string>obj
  //}
  //
  ///**
  // * 安全执行函数
  // * @param thisArg 上下文
  // * @param fn 函数
  // * @param args 执行参数
  // * @return 处理结果
  // */
  //static exec<T>(
  //  thisArg: any,
  //  fn: (...arg: any[]) => any,
  //  ...args: any[]
  //): T {
  //  if (!Validation.is(fn, 'Function')) {
  //    return converters.nil
  //  }
  //  return fn.apply(thisArg, args)
  //}

  /**
   * 从对象中获取值, 如果没有就计算并保存新值
   * @param store 数据仓库
   * @param key 属性名
   * @param fp 属性值计算过程
   */
  static computeIfAbsent<T extends object, K extends keyof T, R extends T[K]>(
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

  ///**
  // * 对象(一级值)属性映射为Pair数组
  // * @param o 对象
  // * @param [sort] Pair数组排序接口, 默认使用对象属性定义顺序
  // */
  //static mapProps<T extends object>(
  //  o: T,
  //  sort?: funcs.Comparator<Pair>
  //): Array<Pair> {
  //  const src: any = o
  //  const props: Array<Pair> = []
  //  if (Validation.isNot(src, 'Object')) {
  //    return props
  //  }
  //
  //  Object.keys(o).forEach((key) => {
  //    const value = src[key]
  //    if (Validation.is(value, 'Function')) return;
  //    // if (Validation.is(value, '[Symbol]')) return;
  //
  //    props.push({
  //      key,
  //      value
  //    })
  //  })
  //
  //  if (sort && Validation.is(sort, 'Function')) {
  //    return props.sort(sort)
  //  }
  //
  //  return props
  //}
  //
  ///**
  // * 对象紧凑处理
  // * @param data 数据对象(无副作用)
  // * @param [recursion] 是否递归处理
  // * @param [nullable] 是否保留null|undefined
  // * @param [emptyStr] 是否保留空字符串
  // * @param [emptyObj] 是否保留空对象
  // * @param [emptyArray] 是否保留空数组
  // * @return 数据对象克隆对象
  // */
  //static compact(
  //  data: any,
  //  recursion = false,
  //  nullable = false,
  //  emptyStr = false,
  //  emptyObj = false,
  //  emptyArray = false
  //): any {
  //  if (!data) return data;
  //
  //  const delKey = (
  //    o: any,
  //    k: string | number
  //  ) => {
  //    if (Validation.is(o, 'Object')) {
  //      delete o[k]
  //    } else if (Validation.is(o, 'Array')) {
  //      o.splice(+k, 1)
  //    }
  //  }
  //
  //  data = this.cloneDeep(data)
  //  utils.foreach(data, (
  //    v,
  //    k
  //  ) => {
  //    if (Validation.isEmpty(v)) {
  //      if (Validation.isNullOrUndefined(v) && !nullable) {
  //        delKey(data, k)
  //        return
  //      }
  //      if (Validation.is(v, 'String') && !emptyStr) {
  //        delKey(data, k)
  //        return
  //      }
  //      if (Validation.is(v, 'Object') && !emptyObj) {
  //        delKey(data, k)
  //        return
  //      }
  //      if (Validation.is(v, 'Array') && !emptyArray) {
  //        delKey(data, k)
  //        return
  //      }
  //    }
  //
  //    if (v instanceof Object && recursion) {
  //      v = this.compact(v);
  //      if (Validation.notEmpty(v)) {
  //        data[k] = v
  //        return
  //      }
  //
  //      if (Validation.is(v, 'Object') && !emptyObj) {
  //        delKey(data, k)
  //        return;
  //      }
  //      if (Validation.is(v, 'Array') && !emptyArray) {
  //        delKey(data, k)
  //
  //      }
  //    }
  //  })
  //
  //  return data
  //}
  //
  ///**
  // * json对象一级属性摊平为数组
  // * @param o jsong对象
  // * @param call 转换函数
  // * @return 结果列表
  // */
  //static flat<T, R>(
  //  o: JsonT<T>,
  //  call: funcs.IDataProcessor<PairT<T>, R>
  //): R[] {
  //  const rs: R[] = converters.anyA
  //  this.foreach(o, (
  //    value,
  //    key
  //  ) => {
  //    const el: R = call({
  //      key,
  //      value
  //    })
  //    rs.push(el)
  //  })
  //  return rs
  //}

  /**
   * 获取对象属性值
   * @param o json对象
   * @param propChain 属性链; e.g: foo.bar, foo[0].bar, ...
   * @return 属性值
   */
  static get<R>(
    o: any,
    propChain: string
  ): R {
    return PropChains.getValue(o, propChain);
  }
}
