import { types } from '@/types/types';
import Cast from '@/tools/Cast';
import Validation from '@/tools/Validation';
import { fns } from '@/types/fns';
import Commons from '@/tools/Commons';
import Jsons from '@/tools/Jsons';
import Functions from '@/tools/Functions';
import Builders from '@/tools/Builders';
import Logics from '@/tools/Logics';

export default class Arrays {

  /**
   * 对象数组通过指定属性名转换为JSON对象
   * @param arr 目标数组
   * @param [keyMapper] 转换接口
   * @param [recover=true] 是否允许覆盖重复值
   * @param [recursion=()=>null] 子属性递归函数, 默认不递归
   */
  static toMap<T>(
    arr: Array<T>,
    keyMapper: fns.OrIteratorMapper<T>,
    recover = true,
    recursion?: fns.IteratorHandler<T, types.Nillable<T[]>>
  ): types.RecordS<T> {

    const result: types.RecordS<T> = Cast.anyO;
    if (Validation.nullOrUndefined(arr, keyMapper)) {
      return result;
    }

    const handler = Builders.iteratorMapper(keyMapper);
    arr.forEach((
      item,
      index
    ) => {
      const key = handler({ item, index });
      if (result[key] && !recover) {
        throw new Error(`不允许重复Key [${String(key)}]`);
      }
      result[key] = item;

      const children = Functions.call(recursion, item) || [];
      if (Validation.notEmpty(children)) {
        const childrenMap = Arrays.toMap<T>(children, key, recover, recursion);
        Jsons.merge(childrenMap, result, recover);
      }
    });

    return result;
  }

  /**
   * 获取所有数组交集元素(引用或值判断)
   * @param args 二维数组
   */
  static intersectionSimple<T>(
    args: Array<T[]>,
  ): T[] {
    if (!args || !args.length || Validation.isEmpty(args)) {
      return [];
    }

    // 仅一个数组
    const first = args[0];
    if (1 === args.length) {
      return first;
    }

    // 获取最大数组长度
    args.sort((
      a,
      b
    ) => a.length - b.length);
    const maxLenArr = args.pop() || [];

    // 使用最长的数组与其他数组取交集
    return maxLenArr.filter(el => {
      let isInclude = true;
      args.forEach(oel => {
        if (isInclude) {
          isInclude = isInclude && oel.includes(el);
        }
      });
      return isInclude;
    });
  }

  /**
   * 获取两个数组的交集
   * @param a 数组a
   * @param b 数组b
   * @param [convertor] 可比较值值转换器
   */
  static intersection<T>(
    a: T[],
    b: T[],
    convertor?: fns.ArrayKeyMapper<T, any>
  ): T[] {
    if (a === b) return a;
    const itemHandler = Builders.toArrayKeyMapperHandler(convertor, 'element');

    const data: T[] = [];
    if (Validation.isNot(a, 'Array') || Validation.isEmpty(a)
      || Validation.isNot(b, 'Array') || Validation.isEmpty(b))
      return data;

    return Logics
      .case(a.length >= b.length, { src: a, other: b })
      .otherwise({ src: b, other: a })
      .get(({ src, other }) => {
        const result: T[] = [];

        this.foreach(src, itemA => {
          const av = itemHandler(itemA);
          this.foreach(other, itemB => {
            const bv = itemHandler(itemB);
            if (av === bv) {
              result.push(itemA.item);
            }
          });
        });

        return result;
      });
  }

  /**
   * 查找元素(或递归满足条件的数组元素属性值)
   * @param arr 数组或元素(数组)属性值
   * @param observer {Function} 值观察者. 成功true否则返回false.
   * @param recursion {Function} 递归属性提取检视器. 没有递归属性返回null否则返回需要递归的数组属性值
   * @returns {Nillable} 查询成功返回目标数据, 否则返回null
   */
  static seek<T>(
    arr: Array<T>,
    observer: fns.ArrayIteratorHandler<T>,
    recursion?: fns.ArrayIteratorHandler<T, types.Nillable<T>>
  ): types.Nillable<types.IteratorItem<T>> {

    let result: types.Nillable<types.IteratorItem<T>> = Cast.nil;
    Arrays.foreach(arr, (item) => {

      // 已经查询到需要的元素
      if (observer(item)) {
        result = item;
        return false;
      }

      // 检测是否需要递归查询
      const children = Functions.call(recursion, item);
      if (Validation.is(children, 'Array')) {
        result = Arrays.seek(<T[]>children, observer, recursion);
        if (Validation.notEmpty(result))
          return false;
      }

      return true;
    });

    return result;
  }

  /**
   * 数组遍历
   * @param arr 数组
   * @param handler 迭代处理器
   * @return 原始数组
   */
  static foreach<T>(
    arr: Array<T>,
    handler: fns.ArrayIteratorHandler<T>
  ): T[] {
    if (Validation.isNot(arr, 'Array')) return arr;

    for (let index = 0, len = arr.length; index < len; index++)
      if (false === handler({ item: arr[index], index }))
        break;

    return arr;
  }

  /**
   * 追加唯一目标值, 如果校验存在则跳过
   * @param arr 数组
   * @param el 新元素
   * @param predictor 唯一值属性名或比较器函数(返回true表示存在)
   * @return 与e匹配的元素索引
   */
  static pushUnique<T>(
    arr: Array<T>,
    el: T,
    predictor?: fns.ArrayPredictor<T>
  ): number {
    const foundIndex = Arrays.index(arr, el, predictor);
    if (-1 !== foundIndex)
      return foundIndex;
    return arr.push(el) - 1;
  }

  /**
   * 查找索引
   * @param arr 数组
   * @param el 查找条件
   * @param predictor 唯一值属性名或比较器函数(返回true表示找到)
   * @return 索引, -1表示未找到
   */
  static index<T>(
    arr: Array<T>,
    el: T,
    predictor?: fns.ArrayPredictor<T>
  ): types.IteratorItem<T> {
    let index = -1;
    const itemHandler = Builders.equalsOtherElement(el, predictor);
    Arrays.foreach<T>(arr, (item) => {
      if (itemHandler(item)) {
        index = item.index;
        return false;
      }
    });
    return { index: index, item: Logics.case(-1 !== index, () => arr[index]).get() };
  }

  /**
   * 查找目标值
   * @param arr 数组
   * @param el 查找条件
   * @param predictor 唯一值属性名或比较器函数(返回true表示找到)
   * @return  查找成功返回目标值, 否则返回null
   */
  static find<T>(
    arr: Array<T>,
    el: T,
    predictor?: fns.ArrayPredictor<T>
  ): T | null {
    const i = Arrays.index(arr, el, predictor);
    return -1 !== i ? arr[i] : null;
  }

  /**
   * 删除
   * @param arr 数组
   * @param {T} el 查找条件
   * @param predictor 唯一值属性名或比较器函数(返回true表示找到)
   * @return {T | null} 删除成功返回被删除目标值, 否则返回null
   */
  static remove<T>(
    arr: Array<T>,
    el: any,
    predictor?: fns.ArrayPredictor<T>
  ): T | null {
    const i = Arrays.index(arr, el, predictor);
    if (-1 === i) {
      return null;
    }
    return arr.splice(i, 1)[0];
  }

  /**
   * 数组减法运算(arrA - arrB), 对象匹配通过引用判定
   * @param arrA 被修改数据
   * @param arrB 目标数组
   * @return 结果(新)数组
   */
  static removeAll<T>(
    arrA: Array<T>,
    arrB: Array<T>
  ): Array<T> {
    return arrA.filter(av => !arrB.includes(av));
  }

  /**
   * 合并
   * @param dist 目标数组
   * @param src 元素组
   * @return 目标数组
   */
  static concat<T>(
    dist: Array<T>,
    src: Array<T>
  ): Array<T> {
    if (Validation.isNot(dist, 'Array') || Validation.isNot(src, 'Array'))
      throw new Error('无效数组参数');
    Array.prototype.push.apply(dist, src);
    return dist;
  }

  /**
   * 是否包含指定值
   * @param arr 数组
   * @param el 数组元素
   * @param predictor 唯一值属性名或比较器函数(返回true表示找到)
   * @return true-已包含, false-未包含
   */
  static contains<T>(
    arr: Array<T>,
    el: T,
    predictor?: fns.ArrayPredictor<T>
  ): boolean {
    return -1 !== Arrays.index(arr, el, predictor);
  }

  /**
   * 数组过滤
   * @param arr 目标数组
   * @param call 回调函数, false-删除, 其他-保留
   */
  static filter<T>(
    arr: Array<T>,
    call: fns.ArrayIteratorHandler<T>
  ) {
    let delKeys: number[] = [];
    Arrays.foreach(arr, (item) => {
      if (false === Functions.call(call, item)) {
        delKeys.push(item.index);
      }
    });

    delKeys = delKeys.reverse();
    Arrays.foreach(delKeys, (item) => arr.splice(item.item, 1));
  }

  /**
   * 数组按指定关键字分组
   * @param arr 数组
   * @param mapper 关键字或者转换器
   */
  static group<T>(
    arr: T[],
    mapper: fns.ArrayKeyMapper<T>
  ): types.RecordS<T[]> {
    const ret: types.RecordS<T[]> = Cast.as();
    const itemHandler = Builders.toArrayKeyMapperHandler(mapper);
    Arrays.foreach(arr, (item) => {
      const rk = itemHandler(item);
      Jsons.computeIfAbsent(ret, rk, () => []);
    });
    return ret;
  }

  /**
   * 提取数组中每个元素的指定属性值到一个数组中
   * @param arr 数组
   * @param propChain 元素中的属性名
   * @return 属性值数组
   */
  static mapProp<T extends Record<K, P>, K extends keyof T, P extends T[K]>(
    arr: Array<T>,
    propChain: K
  ): Array<P> {
    const vals: P[] = [];
    Arrays.foreach(arr, (item) => {
      const val: P = Jsons.get(item.item, propChain.toString());
      if (Validation.notEmpty(val))
        vals.push(val);
    });
    return vals;
  }

  ///**
  // * 去重复
  // * @param arr {Array<T>>} 数组
  // * @param [cover=true] 是否对arr产生副作用
  // * @return arr数组
  // */
  //static unique<T>(
  //  arr: Array<T>,
  //  cover = true
  //): Array<T> {
  //  const tmp = logics.or(arr, [])
  //  if (undefined === tmp) {
  //    return []
  //  }
  //
  //  const uniqueArr: T[] = []
  //  arr.forEach(e => !uniqueArr.includes(e) && uniqueArr.push(e))
  //
  //  if (cover) {
  //    arr.length = 0
  //    Arrays.concat(arr, uniqueArr)
  //  }
  //
  //  return arr
  //}
  //
  ///**
  // * 按指定属性值去重复
  // * @param arr 目标数组
  // * @param func {StringOrIdableConvertor<T>} 属性名或ID提取器函数
  // * @return 处理后无序数组
  // */
  //static uniqueBy<T>(
  //  arr: Array<T>,
  //  func: StringOrIdableConvertor<T>
  //): Array<T> {
  //  return Object.values(Arrays.toMap(arr, func))
  //}
  //
  ///**
  // * 数组合并
  // * @param dist 目标数组
  // * @param otherArr {Array<Array<T>>} 源数组
  // * @return 目标数组
  // */
  //static merge<T>(
  //  dist: Array<T>,
  //  ...otherArr: Array<Array<T>>
  //): Array<T> {
  //  if (!validators.isEmpty(otherArr)) {
  //    Arrays.foreach(otherArr, arr => Arrays.concat<T>(dist, arr))
  //  }
  //  return dist
  //}
  //
  ///**
  // * 元素查找
  // * @param arr 数组
  // * @param proc 匹配器
  // */
  //static fetch<T>(
  //  arr: Array<T>,
  //  proc: funcs.IDataProcessor<T, boolean>
  //): { element: T, index: number } {
  //  const data = {
  //    element: arr[arr.length - 1],
  //    index: arr.length - 1
  //  }
  //  Arrays.foreach(arr, (
  //    e,
  //    i
  //  ) => {
  //    if (proc(e)) {
  //      data.element = e
  //      data.index = i
  //      return false
  //    }
  //  })
  //  return data
  //}
  //
  ///**
  // * 把对象按值对键进行分组
  // * @param obj 对象
  // * @param mapper 值映射器, 返回的数据key
  // */
  //static groupByValue<T>(
  //  obj: Part<T>,
  //  mapper?: funcs.IDataProcessor<T, string>
  //): JsonT<string[]> {
  //  const ret: JsonT<string[]> = converters.cast()
  //
  //  const $mapper = mapper || strings.from
  //  jsons.foreach(obj, (
  //    v,
  //    k
  //  ) => {
  //    const sv = $mapper(v)
  //    const group = ret[sv] || []
  //    group.push(`${k}`)
  //    ret[sv] = group
  //  })
  //
  //  return ret
  //}
  //
  ///**
  // * 生成一组连续值数组. 如果 <i> start >= end</i> 总是返回0长度数组.
  // * @param start 开始值(包含)
  // * @param end 结束值(包含)
  // * @return 数组长度: end - start + 1
  // */
  //static genNums(
  //  start: number,
  //  end: number
  //): number[] {
  //  if (0 >= end - start) {
  //    return []
  //  }
  //
  //  const keyIter = new Array(end + 1).keys()
  //  return [...keyIter].slice(start)
  //}
  //
  ///**
  // * 树形映射
  // * @param arr 目标数组(会被直接改变)
  // * @param [childKey = 'children'] 子节点在父节点的属性名, 覆盖现有属性名会报错.
  // * @param [parentIndex = 'parent'] 子节点指向父节点属性名.
  // * @param [parentKey = 'id'] 被子节点指向的父节点属性名.
  // * @param [onlyRoot=false] 是否从根节点移除所有子节点.
  // */
  //static tree<T>(
  //  arr: T[],
  //  childKey = 'children',
  //  parentIndex = 'parentId',
  //  parentKey = 'id',
  //  onlyRoot = false
  //): T[] {
  //
  //  // 按parentKey映射所有节点
  //  const keyMapper: JsonT<T> = Arrays.toMap(arr, parentKey)
  //
  //  // 所有子节点映射值
  //  const childrenIds: string[] = []
  //
  //  Arrays.foreach(arr, (e: any) => {
  //    const pid = e[parentIndex]
  //    const parent: any = keyMapper[pid]
  //    if (!parent) return
  //
  //    childrenIds.push(e[parentKey])
  //    const children = parent[childKey] || []
  //    children.push(e)
  //    parent[childKey] = Arrays.unique(children)
  //  })
  //
  //  // 移除子节点
  //  if (onlyRoot) {
  //    Arrays.foreach(childrenIds, idKey => {
  //      delete keyMapper[idKey]
  //    })
  //  }
  //
  //  return Object.values(keyMapper)
  //}
  //
  ///**
  // * 树结构转列表
  // * @param root 根节点
  // * @param childKey 子节点列表属性
  // * @param [hasRoot=true] 是否包含根节点
  // * @param [delChildren=false] 是否删除子节点
  // */
  //static flatTree<T>(
  //  root: T,
  //  childKey = 'children' as keyof T,
  //  hasRoot = true,
  //  delChildren = false
  //): T[] {
  //  const arr: T[] = hasRoot ? [root] : []
  //  if (validators.isNot(root, 'Object')) return arr
  //
  //  Arrays.foreach<T>(converters.cast(root[childKey]), (e) => {
  //    arr.push(e)
  //
  //    const children = Arrays.flatTree(e, childKey, false, delChildren);
  //    if (validators.notEmpty(children)) arr.push(...children)
  //  })
  //
  //  if (delChildren) delete root[childKey]
  //
  //  return arr
  //}
}
