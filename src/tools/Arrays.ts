import { types } from '../types/types';
import { Cast } from './Cast';
import { Validation } from './Validation';
import { fns } from '../types/fns';
import { Jsons } from './Jsons';
import { Functions } from './Functions';
import { Builders } from './Builders';
import { Logics } from './Logics';

export class Arrays {

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
      .getValue(({ src, other }) => {
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
    const item = Arrays.index(arr, el, predictor);
    if (-1 !== item.index)
      return item.index;
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
  ): types.ArrayIteratorItem<T> {
    let index = -1;
    const itemHandler = Builders.equalsOtherElement(el, predictor);
    Arrays.foreach<T>(arr, (item) => {
      if (itemHandler(item)) {
        index = item.index;
        return false;
      }
    });
    const item = Logics.case(-1 !== index, arr[index]).getValue();
    return { index: index, item };
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
  ): types.ArrayIteratorItem<T> {
    return Arrays.index(arr, el, predictor);
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
   * 删除
   * @param arr 数组
   * @param condition 查找条件
   * @param predictor 唯一值属性名或比较器函数(返回true表示找到)
   * @return 删除成功返回被删除目标值, 否则返回null
   */
  static remove<T>(
    arr: Array<T>,
    condition: any,
    predictor?: fns.ArrayPredictor<T>
  ): types.Nillable<T> {
    const el = Arrays.index(arr, condition, predictor);
    return Logics.case(this.validateIndex(el), () => arr.splice(el.index, 1)[0]).getValue();
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
    return this.validateIndex(Arrays.index(arr, el, predictor));
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
    Arrays.foreach(delKeys, (item) => {
      arr.splice(item.index, 1);
    });
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
    Arrays.foreach(arr, (el) => {
      const rk = itemHandler(el);
      Jsons.computeIfAbsent<types.RecordS<T[]>>(ret, rk, []).push(el.item);
    });
    return ret;
  }

  /**
   * 提取数组中每个元素的指定属性值到一个数组中
   * @param arr 数组
   * @param propChain 元素中的属性名
   * @return 属性值数组
   */
  static extractProps<T extends Record<K, P>, K extends string & keyof T, P extends T[K]>(
    arr: Array<T>,
    propChain: K
  ): Array<P> {
    const vs: P[] = [];
    Arrays.foreach(arr, (item) => {
      const val: P = Jsons.get(item.item, propChain);
      if (Validation.notEmpty(val))
        vs.push(val);
    });
    return vs;
  }

  /**
   * 去重复
   * @param src 数组
   * @param [cover=true] 是否对参数数组产生副作用
   * @param [akm] 元素唯一值生成器
   * @return 处理结果. 如果 <i>cover===false</i> 结果为新数组, 否则返回 <i>src</i>
   */
  static unique<T>(
    src: T[],
    cover = true,
    akm?: fns.ArrayKeyMapper<T>
  ): T[] {
    if (0 === src.length) return src;

    const keyMapper = Builders.toArrayKeyMapperHandler(akm, 'element');
    const result: T[] = [];
    const keys: string[] = [];
    this.foreach(src, el => {
      const key = keyMapper(el);
      if (!keys.includes(key)) {
        keys.push(key);
        result.push(el.item);
      }
    });

    if (cover) {
      src.length = 0;
      Arrays.concat(src, result);
    }

    return src;
  }

  /**
   * 生成一组连续值数组. 如果 <i> start >= end</i> 总是返回0长度数组.
   * @param start 开始值(包含)
   * @param end 结束值(包含)
   * @return 数组长度: end - start + 1
   */
  static genNums(
    start: number,
    end: number
  ): number[] {
    if (0 >= end - start) return [];
    const keyIter = new Array(end + 1).keys();
    return [...keyIter].slice(start);
  }

  /**
   * 树形映射
   * @param arr 目标数组
   * @param childKey 子节点在父节点的属性名, 覆盖现有属性名会报错.
   * @param parentIndex 子节点指向父节点属性名.
   * @param parentKey 被子节点指向的父节点属性名.
   * @param [onlyRoot=false] 是否从根节点移除所有子节点.
   */
  static tree<T extends Record<CK, T[]> & Record<PK, any> & Record<PI, any>
    , CK extends types.KeyOf<T>
    , PK extends types.KeyOf<T>
    , PI extends types.KeyOf<T>>(
    arr: T[],
    childKey: CK,
    parentIndex: PI,
    parentKey: PK,
    onlyRoot = false
  ): T[] {

    // 按parentKey映射所有节点
    const keyMapper: types.RecordS<T> = Arrays.toMap(arr, parentKey);

    // 所有子节点映射值
    const childrenIds: string[] = [];

    Arrays.foreach(arr, el => {
      const pid: types.KeyOf<T> = Jsons.get(el.item, parentIndex.toString());
      const parent: T = keyMapper[pid];
      if (!parent) return;

      childrenIds.push(Jsons.get<string>(el.item, parentKey.toString()));
      const children: T[CK] = Jsons.computeIfAbsent(parent, childKey, [] as any);
      children.push(el.item);
      parent[childKey] = Arrays.unique(children) as T[CK];
    });

    // 移除子节点
    if (onlyRoot) {
      Arrays.foreach(childrenIds, el => {
        delete keyMapper[el.item];
      });
    }

    return Object.values(keyMapper);
  }

  /**
   * 树结构转列表
   * @param root 根节点
   * @param childKey 子节点列表属性
   * @param [hasRoot=true] 是否包含根节点
   * @param [delChildren=false] 是否删除子节点
   */
  static flatTreeSR<T extends Record<CK, T[]>, CK extends types.KeyOfOnly<T>>(
    root: T,
    childKey: CK,
    hasRoot = true,
    delChildren = false
  ): T[] {
    const arr: T[] = hasRoot ? [root] : [];
    if (Validation.isNot(root, 'Object')) return arr;

    Arrays.foreach<T>(root[childKey], (el) => {
      arr.push(el.item);

      const children = Arrays.flatTreeSR(el.item, childKey, false, delChildren);
      if (Validation.notEmpty(children)) arr.push(...children);
    });

    if (delChildren) delete root[childKey];
    return arr;
  }

  /**
   * (多根)树结构转列表
   * @param root 根节点
   * @param childKey 子节点列表属性
   * @param [hasRoot=true] 是否包含根节点
   * @param [delChildren=false] 是否删除子节点
   * @param [akm] 列表去重判定属性名或元素映射函数
   */
  static flatTreeMR<T extends Record<CK, T[]>, CK extends types.KeyOfOnly<T>>(
    root: T[],
    childKey: CK,
    hasRoot = true,
    delChildren = false,
    akm?: fns.ArrayKeyMapper<T>,
  ): T[] {
    const result: T[] = [];
    this.foreach(root, el => {
      const nodes = this.flatTreeSR(el.item, childKey, hasRoot, delChildren);
      this.concat(result, nodes);
    });
    return akm ? this.unique(result, false, akm) : result;
  }

  /**
   * 校验数组元素索引是否有效
   * @param element 数组元素
   * @return 有效返回true，否则返回false
   * @private
   */
  private static validateIndex<T>(element: types.ArrayIteratorItem<T>): boolean {
    return 0 <= element.index;
  }
}
