import { Jsons } from './Jsons';
import { Arrays } from './Arrays';
import { Validation } from './Validation';

export class Strings {

  /**
   * 字符串替换
   * @param s 字符串
   * @param cfg 属性名:正则表达式分组字符串, 属性值:要替换的值
   */
  static replaceAll(
    s = '',
    cfg: { [s: string]: string } = {}
  ): string {
    let tmp = s;
    Jsons.foreach(cfg, el => {
      const regExp = new RegExp(`${el.index}`, 'g');
      tmp = tmp.replace(regExp, el.item);
    });
    return tmp;
  }

  /**
   * 校验是否包含空字符串
   * @param [useTrim=true] 是否去除两端空格
   * @param arr  被检测字符串
   * @return 包含至少一个空字符串返回true, 否则返回false
   */
  static hasBlank(
    useTrim = true,
    ...arr: string[]
  ): boolean {
    let isFoundBlank = false;
    Arrays.foreach(arr, el => {
      if (this.isBlank(el.item, useTrim)) {
        isFoundBlank = true;
        return false;
      }
    });
    return isFoundBlank;
  }

  /**
   * 空字符串校验
   * @param s  字符串
   * @param [useTrim=true]  是否去除两端空格
   * @return 空字符串返回true, 否则返回false
   */
  static isBlank(
    s: string,
    useTrim = true
  ): boolean {
    if (Validation.isNot(s, 'String')) {
      return false;
    }

    if (Validation.isNil(s)) {
      return true;
    }

    if (useTrim) {
      s = s.trim();
    }
    return 0 === s.length;
  }

  /**
   * 生成唯一ID
   * @return 唯一字符串
   */
  static guid(): string {
    const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
  }

  /**
   * 对象转string
   * @param o 对象
   */
  static toString(o: any): string {
    return `${o}`;
  }

  /**
   * 去掉两端空格, s为null/undefined时返回''
   * @param s 源字符串
   */
  static trimToEmpty(s: string): string {
    if (Validation.isNil(s))
      return '';
    return s.toString().trim();
  }

  /**
   * HTML内容转义为普通文本
   * @param html HTML内容
   * @return HTML转义后字符串
   */
  static html2text(html: any): string {
    let temp: any = document.createElement('i');
    (temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
    const output = temp.innerHTML;
    temp = null;
    return output;
  }

  /**
   * 普通文本转HTML内容
   * @param text 普通文本
   * @return HTML标签(转义后)还原
   */
  static text2html(text: any): string {
    let temp: any = document.createElement('i');
    temp.innerHTML = text;
    const output = temp.innerText || temp.textContent;
    temp = null;
    return output;
  }
}
