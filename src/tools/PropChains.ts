import Validation from '@/tools/Validation';
import Objects from '@/tools/Objects';
import Arrays from '@/tools/Arrays';
import { types } from '@/types/types';
import Cast from '@/tools/Cast';

/**
 * ONGL表达式解析对象
 */
class Ognl {
  floors = [] as number[];
  isArray = false;
  key = '';
  next = Cast.anyO;
  nextKey = '';

  /**
   * 构建Ognl表达式对象
   * @param propChain 属性链描述字符串
   */
  constructor(private propChain: string) {
    this.parse();
  }

  private parse() {
    this.key = '';
    this.nextKey = '';
    this.isArray = false;
    this.floors = [];
    this.next = null;

    const objIndex = this.propChain.indexOf('.');
    const arrIndex = this.propChain.indexOf('[');

    if (-1 !== arrIndex) {
      if ((-1 === objIndex) || (arrIndex < objIndex)) {
        this.isArray = true;
      }
    }

    const hasMoreObj = (-1 !== objIndex);
    if (hasMoreObj) {
      this.key = this.propChain.substring(0, objIndex);
      this.nextKey = this.propChain.substring(objIndex + 1);
      this.next = new Ognl(this.propChain.substring(objIndex + 1));
    } else {
      this.key = this.propChain;
      this.next = null;
    }

    if (this.isArray) {
      const sp = this.key.split('[').filter((e) => !!e);
      this.key = parseInt(sp.shift()!).toString();
      for (const i in sp) {
        // 0] => 0
        // 截取索引部分
        const arrIndex = parseInt(sp[i]);
        this.floors.push(arrIndex);
      }
    }
  }

}

/**
 * 属性链工具
 */
export default class PropChains {

  /**
   * 获取数组对象的值
   * @param data {Object} 数据对象
   * @param ognl {String} ognl表达式
   */
  static getArrOgnlVal(
    data: any,
    ognl: string
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
      if (Validation.isNot(val, 'Array')) return false;
      val = val[parseInt((v + '').replace('[', '').replace(']', ''))];
    });
    return val;
  }

  /**
   * 获取属性值
   * @param data {Object} 数据对象
   * @param ognl {String} ognl表达式
   */
  static getValue<R>(
    data: any,
    ognl: string
  ): R {
    if (Validation.nullOrUndefined(data)) return null!;
    ognl = ognl.trim();

    const keys = ognl.split('.');
    if (1 === keys.length) {
      // 非数组
      const regex = /\[/;
      if (!regex.test(ognl))
        return data ? data[ognl] : data;
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
   * 设置属性值
   * @param target 目标对象
   * @param ognl ognl表达式
   */
  static setValue<R>(
    target: any,
    ognl: string
  ): types.Nillable<R> {
    // todo 设置值
    return null;
  }
}
