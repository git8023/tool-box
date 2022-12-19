import { Arrays } from './Arrays';
import { BError } from './BError';
import { Cast } from './Cast';
import { Validation } from './Validation';

/**
 * 属性链工具
 */
export class PropChains {

  /**原始属性链*/
  origin!: string;
  /**当前层级*/
  hierarchy!: number;
  /**期望类型*/
  expectType!: 'array' | 'object';
  /**当前节点属性名*/
  prop!: string | number;
  /**值*/
  value!: any;
  /**下个节点*/
  next!: PropChains;

  /**
   * 获取数组对象的值
   * @param data 数据对象
   * @param ognl ognl表达式
   */
  static getArrOgnlVal(
    data: any,
    ognl: string,
  ) {
    // 获取数组对象
    const sIdx = ognl.indexOf('[');
    let arr: any[];

    // 数组对象需要从data子属性获取
    if (0 < sIdx) {
      const arrK = ognl.substring(0, sIdx);
      arr = data[arrK];
    }
    // ognl指向data自身
    else {
      arr = data;
    }

    const idxStr = ognl.substring(sIdx);
    const idxReg = /^(\[\d+])+$/;
    if (!idxReg.test(idxStr)) {
      throw new Error('非法下标索引:' + idxStr);
    }

    // 获取值[1], [0][2]...
    const idxes = idxStr.split('][');

    // 一维数组
    if (1 === idxes.length) {
      const arrIndex = +idxStr.replace('[', '').replace(']', '');
      return arr[arrIndex];
    }

    // 多维数组
    let val = arr;
    // jstAPI.common.eachValue(idxes, function (v) {
    Arrays.foreach(idxes, (v) => {
      if (Validation.isNot(val, 'Array')) {
        return false;
      }
      val = val[parseInt((v + '').replace('[', '').replace(']', ''))];
    });
    return val;
  }

  /**
   * 获取属性值
   * @param data 数据对象
   * @param ognl ognl表达式
   */
  static getValue<R>(
    data: any,
    ognl: string,
  ): R {
    if (Validation.nullOrUndefined(data)) {
      return null!;
    }
    ognl = ognl.trim();

    const keys = ognl.split('.');
    if (1 === keys.length) {
      // 非数组
      const regex = /\[/;
      if (!regex.test(ognl)) {
        return data ? data[ognl] : data;
      }
      return PropChains.getArrOgnlVal(data, ognl);
    }

    const idx = ognl.indexOf('.');
    const key = ognl.substring(0, idx);
    const isArr = /\[\d+]/.test(key);
    const valObj = isArr ? PropChains.getArrOgnlVal(data, key) : data[key];
    const newOgnl = ognl.substring(idx + 1);
    return PropChains.getValue(valObj, newOgnl);
  }

  /**
   * 设置对象属性值
   * @param o 数据对象
   * @param propChain 属性链
   * @param v 值
   */
  static setValue<T, R>(o: T, propChain: string, v: R): R {
    if (Validation.isNil(o)) {
      return Cast.nil;
    }
    return PropChains.parse(propChain).setValue(o, v);
  }

  /**
   * 解析ognl表达式
   * @param chain 属性链表达式
   * @param [hierarchy=0] 属性层级, 外部调用不传
   */
  public static parse(chain: string, hierarchy = 0): PropChains {
    const propChains = new PropChains();
    propChains.origin = chain;
    propChains.hierarchy = hierarchy;

    let validOk = !chain.startsWith('.');   // 不能以.开头
    validOk = validOk && /^\D/.test(chain); // 不能以数字开头
    BError.iff(validOk, '属性链无效');

    // 提取：Array
    if (chain.startsWith('[')) {
      const arrIdx = chain.match(/^\[(.+)]/)!;
      propChains.prop = +arrIdx[1];
      BError.iff(Validation.is(propChains.prop, 'Number'), `索引无效: ${chain}, 期望类型 Number`);
      propChains.expectType = 'array';

      // 截取已消费节点
      const nextStartIndex = chain.indexOf(']');
      const surplus = chain.substring(nextStartIndex + 1);
      if (surplus) {
        const chainSurplus = surplus.replace(/^\./, '');
        propChains.next = PropChains.parse(chainSurplus, hierarchy + 1);
      }
      return propChains;
    }

    // 提取: Object
    const omr = chain.match(/^(.+)[.[]/) || [undefined, chain];
    propChains.prop = omr[1]!;
    propChains.expectType = propChains.prop.includes('[') ? 'array' : 'object';
    const surplus = chain.substring(propChains.prop!.length);
    if (surplus) {
      const chainSurplus = surplus.replace(/^\./, '');
      propChains.next = PropChains.parse(chainSurplus, hierarchy + 1);
    }

    return propChains;
  }

  /**
   * 设置每个层级对应值
   * @param o 对象
   * @param v 值
   * @private
   */
  private setValue<T, R>(o: T, v: R): R {
    const to: any = o;
    const val = to[this.prop];
    const originValType = Object.prototype.toString.call(val);

    // 只有一层属性
    if (!this.next) {
      switch (this.expectType) {
        case 'array':
          BError.iff(
            Validation.is(o, 'Array'),
            `但类型错误. 期望[Array]实际[${originValType}]`,
          );
          break;
        case 'object':
          BError.iff(
            Validation.is(o, 'Object'),
            `但类型错误. 期望[Object]实际[${originValType}]`,
          );
          break;
      }
      this.value = to[this.prop] = v;
      return this.value;
    }

    // 多层属性
    const hasVal = Validation.notNil(val);
    switch (this.expectType) {
      case 'array': {
        // if (hasVal) {
        //   BError.iff(
        //     Validation.is(this.value, 'Array'),
        //     `目标属性已存在, 但类型错误. 期望[Array]实际[${originValType}]`,
        //   );
        //   return v;
        // }

        // e.g: foo[0]
        const sp = String(this.prop).split('[');
        if (sp.length === 2) {
          this.value = to[this.prop] = to[this.prop] ?? [];
          if (this.next) {
            const index = parseInt(sp[1]);
            this.value = this.value[index] = (this.next.expectType === 'object' ? {} : []);
          }
        }
        // e.g: foo[0][1]
        else if (sp.length > 2) {
          const arrProp = sp[0];
          let arrTmp: any[] = to[arrProp] = to[arrProp] ?? [];
          const lastArrIndex = parseInt(sp.pop()!);
          for (let i = 1; i < sp.length; i++) {
            const index = parseInt(sp[i]);
            const oldVal = arrTmp[index];
            if (Validation.notNil(oldVal)) {
              BError.iff(
                Validation.is(oldVal, 'Array'),
                `数据[${this.prop}]类型错误, 期望[[object Array]]实际[${Object.prototype.toString.call(oldVal)}]`,
              );
            }
            arrTmp[index] = oldVal ?? [];
            arrTmp = arrTmp[index];
          }
          if (this.next) {
            this.value = arrTmp[lastArrIndex] = (this.next.expectType === 'object' ? {} : []);
          }
        } else {
          this.value = to[this.prop] = [];
        }
        break;
      }
      case 'object':
        if (hasVal) {
          BError.iff(
            Validation.is(o, 'Object'),
            `目标属性已存在, 但类型错误. 期望[Object]实际[${originValType}]`,
          );
        } else {
          this.value = to[this.prop] = {};
        }
        break;
    }
    return this.next.setValue(this.value, v);
  }
}
